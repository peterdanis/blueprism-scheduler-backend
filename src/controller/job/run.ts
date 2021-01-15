import { EventEmitter } from "events";
import Job from "../../entity/Job";
import JobLog from "../../entity/JobLog";
import log from "../../utils/logger";
import path from "path";
import ScheduleTask from "../../entity/ScheduleTask";
import { Worker } from "worker_threads";

export interface WorkerMessage {
  completed?: boolean;
  hardTimeoutReached?: boolean;
  sessionId?: string;
  softTimeoutReached?: boolean;
  stopped?: boolean;
  terminated?: boolean;
}

export class JobRef extends EventEmitter {
  job: Job;

  delete = false;

  constructor(job: Job) {
    super();
    this.job = job;
  }
}

export const run = (job: Job): JobRef => {
  log("run start");
  let jobHardStopRequested = false;
  let jobSoftStopRequested = false;
  let partialFailure = false;
  log(path.resolve(__dirname, "./runWorker.js"));
  let worker = new Worker(path.resolve(__dirname, "./runWorker.js"), {});
  const jobRef = new JobRef(job);

  const jobHardStopTimer = setTimeout(() => {
    jobRef.emit("jobHardStop", `Job${job.id}`);
  }, job.schedule.hardTimeout);

  const jobSoftStopTimer = setTimeout(() => {
    jobRef.emit("jobSoftStop", `Job${job.id}`);
  }, job.schedule.hardTimeout);

  const getCurrentTask = (): ScheduleTask | undefined =>
    job.schedule.scheduleTask.sort((task1, task2) => task1.step - task2.step)[
      job.step - 1
    ];

  const lastStep = (): boolean => getCurrentTask()?.step === job.step;

  // TODO:
  const sendStop = async (): Promise<void> => {
    try {
      log("running stop");
      // retry?
      // fetch.post
    } catch (error) {
      log(error);
    }
  };

  const closeJob = async (failed?: boolean): Promise<void> => {
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
    job.endTime = new Date();
    /* eslint-enable no-param-reassign */
    await job.save();

    await worker.terminate();
    clearTimeout(jobHardStopTimer);
    clearTimeout(jobSoftStopTimer);
    jobRef.delete = true;
    const jobLog = JobLog.create({
      ...job,
      runtimeResourceId: job.runtimeResource.id,
      scheduleId: job.schedule.id,
    });
    await jobLog.save();
    await job.remove();
    // TODO: add reset route call
  };

  const runWorker = (): void => {
    if (!jobSoftStopRequested || !jobHardStopRequested) {
      worker.postMessage(job);
    }
  };

  const onStepCompleted = async (): Promise<void> => {
    if (lastStep()) {
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

  const onTaskError = async (error: Error): Promise<void> => {
    log(`Error while executing job with id ${job.id}`);
    log(error);
    if (getCurrentTask()?.abortEarly) {
      await closeJob(true);
      return;
    }
    partialFailure = true;
    await onStepCompleted();
  };

  const stepSoftStop = async (): Promise<void> => {
    try {
      await sendStop();
    } catch (error) {
      log(error);
    }
  };

  const stepHardStop = async (): Promise<void> => {
    await worker.terminate();
    if (lastStep()) {
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
        terminated,
      }: WorkerMessage) => {
        switch (true) {
          case completed:
            await onStepCompleted();
            break;
          case stopped:
            await onStepCompleted();
            break;
          case terminated:
            await onTaskError(new Error("Process terminated"));
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
      if (!jobSoftStopRequested || !jobHardStopRequested) {
        worker = new Worker(path.resolve(__dirname, "./runWorker.js"));
        addWorkerListeners();
      }
    });
  };

  jobRef.on("jobSoftStop", async (user: string) => {
    log(`Soft stop requested for job with id ${job.id}, by ${user}`);
    jobSoftStopRequested = true;
    if (job.subStep === 1) {
      await closeJob();
      return;
    }
    await stepSoftStop();
  });

  jobRef.on("jobHardStop", async (user: string) => {
    log(`Hard stop requested for job with id ${job.id}, by ${user}`);
    jobHardStopRequested = true;
    await closeJob(true);
  });

  addWorkerListeners();
  // TODO: add reset route call
  // TODO: wrap it in worker.init()?
  runWorker();

  return jobRef;
};
