import axiosRetry, { isNetworkOrIdempotentRequestError } from "axios-retry";
import { getHeader, getUrl } from "../../utils/getUrlAndHeader";
import axios from "axios";
import { EventEmitter } from "events";
import Job from "../../entity/Job";
import JobLog from "../../entity/JobLog";
import logger from "../../utils/logger";
import path from "path";
import ScheduleTask from "../../entity/ScheduleTask";
import { StepStatus } from "../../entity/JobBase";
import { Worker } from "worker_threads";

axiosRetry(axios, {
  retries: 3,
  retryCondition: (error) => {
    if (error.response?.status === 503) {
      return true;
    }
    return isNetworkOrIdempotentRequestError(error);
  },
  retryDelay: (retryCount) => retryCount * 30000,
});

/**
 * Lists all possible messages from worker thread.
 */
export interface WorkerMessage {
  completed?: boolean;
  hardTimeoutReached?: boolean;
  sessionId?: string;
  softTimeoutReached?: boolean;
  stopped?: boolean;
  failed?: boolean;
}

/**
 * Job reference, to emit soft/hard stop events.
 */
export class JobRef extends EventEmitter {
  job: Job;

  delete = false;

  constructor(job: Job) {
    super();
    this.job = job;
  }
}

/**
 * Returns details of job's current task.
 */
export const getCurrentTask = (job: Job): ScheduleTask | undefined =>
  job.schedule.scheduleTask.sort((task1, task2) => task1.step - task2.step)[
    job.step - 1
  ];

/**
 * Return true if job.step is last one for given job.
 */
const isLastStep = (job: Job): boolean => {
  const currentTask = getCurrentTask(job);
  if (currentTask) {
    return currentTask.step >= job.schedule.scheduleTask.length;
  }
  return true;
};

/**
 * Starts a new worker thread for each new job and controls job process flow.
 *
 * @returns reference to job, to be able to stop it from outside.
 */
export const run = (job: Job): JobRef => {
  const log = logger.child({ jobId: job.id });

  const { schedule, runtimeResource } = job;
  let jobHardStopRequested = false;
  let jobSoftStopRequested = false;
  let partialFailure = false;
  let stopping = false;
  let worker = new Worker(path.join(__dirname, "runWorker.js"));
  const jobRef = new JobRef(job);

  log.info("Starting job", { workerId: worker.threadId });

  const jobHardStopTimer = setTimeout(() => {
    jobRef.emit("jobHardStop", `Job${job.id}`);
  }, schedule.hardTimeout);

  const jobSoftStopTimer = setTimeout(() => {
    jobRef.emit("jobSoftStop", `Job${job.id}`);
  }, schedule.softTimeout);

  const sendStop = async (): Promise<void> => {
    log.info("Running stop");
    try {
      // will retry via axios-retry
      await axios.post(getUrl(job, "stop"), {}, getHeader(job));
    } catch (error) {
      log.error(error.message, { error: error.response.data });
    }
  };

  const closeJob = async (failed?: boolean): Promise<void> => {
    stopping = true;
    try {
      await worker.terminate();
    } catch (error) {
      log.error(error.message);
    }

    /* eslint-disable no-param-reassign */
    job.endTime = new Date();
    switch (true) {
      case failed:
        job.status = "failed";
        break;
      case jobSoftStopRequested:
        job.status = "stopped";
        break;
      case partialFailure:
        job.status = "finished with notes";
        break;
      default:
        job.status = "finished";
        break;
    }
    /* eslint-enable no-param-reassign */
    log.info("Closing job", { status: job.status });

    // Reset runtime resource after last step
    try {
      log.info("Post reset");
      // will retry via axios-retry
      await axios.post(getUrl(job, "reset"), {}, getHeader(job));
    } catch (error) {
      log.error(error.message, { error });
    }

    await job.save();

    // Clear timeouts and mark job reference for deletion
    clearTimeout(jobHardStopTimer);
    clearTimeout(jobSoftStopTimer);
    jobRef.delete = true;

    // Move job from active queue to log
    const jobLog = JobLog.create({
      ...job,
      jobId: job.id,
      runtimeResourceId: runtimeResource.id,
      scheduleId: schedule.id,
    });
    await jobLog.save();
    await job.remove();
  };

  const runWorker = (): void => {
    worker.postMessage(job);
  };

  const onStepCompleted = async (stepStatus: StepStatus): Promise<void> => {
    /* eslint-disable no-param-reassign */
    job.steps = {
      ...job.steps,
      [job.step]: { sessionId: job.sessionId, status: stepStatus },
    };
    job.sessionId = undefined;
    if (isLastStep(job) || jobSoftStopRequested || jobHardStopRequested) {
      await closeJob();
      return;
    }
    job.step++;
    job.subStep = 1;
    await job.save();
    /* eslint-enable no-param-reassign */
    runWorker();
  };

  const onTaskError = async (error: Error): Promise<void> => {
    log.error(error.message, { error });

    if (getCurrentTask(job)?.abortEarly) {
      log.info("Aborting early");
      await closeJob(true);
      return;
    }
    partialFailure = true;
    log.info("Marked as partial failure, continuing");
    await onStepCompleted("failed");
  };

  const stepSoftStop = async (): Promise<void> => {
    log.warn("stepSoftStop requested");
    partialFailure = true;
    await sendStop();
  };

  const stepHardStop = async (): Promise<void> => {
    log.warn("stepHardStop requested");
    partialFailure = true;
    await worker.terminate();
    if (isLastStep(job)) {
      await closeJob();
      return;
    }
    await onStepCompleted("failed");
  };

  const addWorkerListeners = (): void => {
    worker.on("message", async (value: WorkerMessage) => {
      const {
        completed,
        hardTimeoutReached,
        sessionId,
        softTimeoutReached,
        stopped,
        failed,
      } = value;
      log.info("Message from worker", { value });

      switch (true) {
        case completed:
          await onStepCompleted("finished");
          break;
        case stopped:
          await onStepCompleted("stopped");
          break;
        case failed:
          await onTaskError(new Error("Process failed"));
          break;
        case hardTimeoutReached:
          await stepHardStop();
          break;
        case softTimeoutReached:
          await stepSoftStop();
          break;
        case !!sessionId:
          /* eslint-disable no-param-reassign */
          job.subStep++;
          job.sessionId = sessionId;
          /* eslint-enable no-param-reassign */
          await job.save();
          break;
        default:
          log.error("Unknown message");
          await closeJob(true);
          break;
      }
    });

    worker.on("error", async (error) => {
      await onTaskError(error);
    });

    worker.on("exit", () => {
      // Create new worker and re-add listeners if worker.terminate() was used, but it was not the last step
      if (!jobSoftStopRequested && !jobHardStopRequested && !stopping) {
        worker = new Worker(path.resolve(__dirname, "./runWorker.js"));
        addWorkerListeners();
      }
    });
  };

  jobRef.on("jobSoftStop", async (user: string) => {
    log.warn("jobSoftStop requested", { user });
    jobSoftStopRequested = true;
    if (job.subStep === 1) {
      await closeJob();
      return;
    }
    await stepSoftStop();
  });

  jobRef.on("jobHardStop", async (user: string) => {
    log.warn("jobHardStop requested", { user });
    jobHardStopRequested = true;
    await closeJob(true);
  });

  addWorkerListeners();
  runWorker();

  return jobRef;
};
