import { getHeader, getUrl } from "../../utils/getUrlAndHeader";
import axios from "axios";
import { EventEmitter } from "events";
import Job from "../../entities/Job";
import logger from "../../utils/logger";
import path from "path";
import retry from "../../utils/retry";
import ScheduleTask from "../../entities/ScheduleTask";
import { StepStatus } from "../../entities/JobBase";
import { transferJob } from "../jobLog";
import { Worker } from "worker_threads";

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
export const run = (_job: Job): JobRef => {
  const job = _job;
  const log = logger.child({ jobId: job.id });

  const { schedule } = job;
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
      if (job.sessionId) {
        await retry(() => axios.post(getUrl(job, "stop"), {}, getHeader(job)));
      } else {
        throw new Error("sessionId is not defined, can't stop this step");
      }
    } catch (error) {
      log.error(error.message, { error: error.response.data });
      throw error;
    }
  };

  const closeJob = async (failed?: boolean): Promise<void> => {
    stopping = true;
    try {
      await worker.terminate();
    } catch (error) {
      log.error(error.message);
    }

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
    log.info("Closing job", { status: job.status });

    // Reset runtime resource after last step
    try {
      log.info("Post reset");
      await retry(() => axios.post(getUrl(job, "reset"), {}, getHeader(job)));
    } catch (error) {
      log.error(error.message, { error });
    }

    await retry(() => job.save());

    // Clear timeouts
    clearTimeout(jobHardStopTimer);
    clearTimeout(jobSoftStopTimer);

    // Move job from active queue to log and mark job reference for deletion
    await transferJob(job, "Transferred by scheduler");
    jobRef.delete = true;
  };

  const runWorker = (): void => {
    worker.postMessage(job);
  };

  const onStepCompleted = async (stepStatus: StepStatus): Promise<void> => {
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
    await retry(() => job.save());
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
    try {
      await sendStop();
    } catch (error) {
      await onStepCompleted("failed");
    }
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
        case failed:
          await onTaskError(new Error("Process failed"));
          break;
        case hardTimeoutReached:
          await stepHardStop();
          break;
        case softTimeoutReached:
          await stepSoftStop();
          break;
        case completed:
          await onStepCompleted("finished");
          break;
        case stopped:
          await onStepCompleted("stopped");
          break;
        case !!sessionId:
          job.subStep++;
          job.sessionId = sessionId;
          await retry(() => job.save());
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
