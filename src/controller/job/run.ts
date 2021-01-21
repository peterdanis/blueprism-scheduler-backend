import { getHeader, getUrl } from "../../utils/getUrlAndHeader";
import axios from "axios";
import axiosRetry from "axios-retry";
import { EventEmitter } from "events";
import Job from "../../entity/Job";
import JobLog from "../../entity/JobLog";
import logger from "../../utils/logger";
import path from "path";
import ScheduleTask from "../../entity/ScheduleTask";
import { Worker } from "worker_threads";

axiosRetry(axios, { retries: 3, retryDelay: () => 20 });

interface CustomError extends Error {
  data?: unknown;
}

export interface WorkerMessage {
  completed?: boolean;
  hardTimeoutReached?: boolean;
  sessionId?: string;
  softTimeoutReached?: boolean;
  stopped?: boolean;
  failed?: boolean;
}

export class JobRef extends EventEmitter {
  job: Job;

  delete = false;

  constructor(job: Job) {
    super();
    this.job = job;
  }
}

export const getCurrentTask = (job: Job): ScheduleTask | undefined =>
  job.schedule.scheduleTask.sort((task1, task2) => task1.step - task2.step)[
    job.step - 1
  ];

export const lastStep = (job: Job): boolean => {
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
  let worker = new Worker(path.resolve(__dirname, "./runWorker.js"));
  log.info("Starting job", { workerId: worker.threadId });
  const jobRef = new JobRef(job);

  const jobHardStopTimer = setTimeout(() => {
    jobRef.emit("jobHardStop", `Job${job.id}`);
  }, schedule.hardTimeout);

  const jobSoftStopTimer = setTimeout(() => {
    jobRef.emit("jobSoftStop", `Job${job.id}`);
  }, schedule.softTimeout);

  const sendStop = async (): Promise<void> => {
    try {
      log.info("running stop");
      // will retry via axios-retry
      await axios.post(getUrl(job, "stop"), {}, getHeader(job));
    } catch (error) {
      log.error(error.message, { error });
    }
  };

  const closeJob = async (failed?: boolean): Promise<void> => {
    stopping = true;
    /* eslint-disable no-param-reassign */
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
      // will retry via axios-retry
      await axios.post(getUrl(job, "reset"), {}, getHeader(job));
    } catch (error) {
      log.error(error.message, { error });
    }

    job.endTime = new Date();
    /* eslint-enable no-param-reassign */
    await job.save();

    await worker.terminate();
    clearTimeout(jobHardStopTimer);
    clearTimeout(jobSoftStopTimer);
    jobRef.delete = true;
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
    if (!jobSoftStopRequested || !jobHardStopRequested) {
      worker.postMessage(job);
    }
  };

  const onStepCompleted = async (): Promise<void> => {
    if (lastStep(job)) {
      await closeJob();
      return;
    }
    /* eslint-disable no-param-reassign */
    job.step++;
    job.subStep = 1;
    job.sessionId = undefined;
    await job.save();
    /* eslint-enable no-param-reassign */
    runWorker();
  };

  const onTaskError = async (error: CustomError): Promise<void> => {
    log.error(error.message, { error });

    if (getCurrentTask(job)?.abortEarly) {
      log.info("Aborting early");
      await closeJob(true);
      return;
    }
    partialFailure = true;
    log.info("Marked as partial failure, continuing");
    await onStepCompleted();
  };

  const stepSoftStop = async (): Promise<void> => {
    try {
      log.warn("stepSoftStop requested");
      await sendStop();
    } catch (error) {
      log.error(error.message, { error });
    }
  };

  const stepHardStop = async (): Promise<void> => {
    log.warn("stepHardStop requested");
    await worker.terminate();
    if (lastStep(job)) {
      await closeJob();
      return;
    }
    await onStepCompleted();
  };

  const addWorkerListeners = (): void => {
    worker.on(
      "message",
      async ({
        completed,
        hardTimeoutReached,
        sessionId,
        softTimeoutReached,
        stopped,
        failed,
      }: WorkerMessage) => {
        switch (true) {
          case completed:
            await onStepCompleted();
            break;
          case stopped:
            await onStepCompleted();
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
            break;
        }
      },
    );

    worker.on("error", async (error) => {
      await onTaskError(error);
    });

    worker.on("exit", () => {
      // Create new worker and re-add listeners if worker.terminate() was used, but it was not the last step
      if (!jobSoftStopRequested || !jobHardStopRequested || !stopping) {
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
