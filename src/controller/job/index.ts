import { EventEmitter } from "events";
import Job from "../../entity/Job";
import JobLog from "../../entity/JobLog";
import log from "../../utils/logger";
import Schedule from "../../entity/Schedule";
import ScheduleTask from "../../entity/ScheduleTask";
import sleep from "../../utils/sleep";

// TODO: delete
class A extends EventEmitter {
  job!: Job;
}

let checking = false;
let firstRun = true;
const runningJobRef: A[] = [];

/**
 * Returns array of unique resource ids found in given job array
 */
const getResourcesFromJobs = (jobs: Job[]): number[] => {
  const reducer = (acc: number[], val: Job): number[] => {
    const { runtimeResource } = val;
    return acc.includes(runtimeResource.id)
      ? acc
      : [runtimeResource.id, ...acc];
  };
  return jobs.reduce(reducer, []);
};

/**
 * Returns jobs sorted by priority, from lowest to highest. Jobs with lower priority should go first.
 */
const orderByPriority = (jobs: Job[]): Job[] => {
  return jobs.sort((first, second) => first.priority - second.priority);
};

/**
 * Returns jobs for given resource id.
 */
const filterByResource = (id: number, jobs: Job[]): Job[] => {
  return jobs.filter(({ runtimeResource }) => runtimeResource.id === id);
};

/**
 * Returns jobs with given status.
 */
const filterByStatus = (jobStatus: Job["status"], jobs: Job[]): Job[] => {
  return jobs.filter(({ status }) => status === jobStatus);
};

/**
 * Returns true if no jobs are in "running" status for given resource id.
 */
const isResourceFree = (id: number, jobs: Job[]): boolean => {
  return (
    filterByResource(id, jobs).filter(({ status }) => status === "running")
      .length === 0
  );
};

/**
 * Adds job to queue and returns the reference to it.
 */
export const addJob = async (schedule: Schedule): Promise<Job> => {
  const { id, rule, priority, runtimeResource } = schedule;

  const job = Job.create({
    addTime: new Date(),
    priority,
    runtimeResource,
    schedule,
    status: "waiting",
  });
  log(`Adding job, schedule ${id} and rule ${rule} to jobs`);
  return job.save();
};

const run = async (job: Job): Promise<void> => {
  const jobRef = job;

  // TODO: delete
  const a = new A();
  a.job = job;
  runningJobRef.push(a);

  const innerRun = async (): Promise<void> => {
    const {
      // sessionId,
      step,
      // subStep,
      // runtimeResource: { id },
      schedule: { scheduleTask },
    } = jobRef;
    log(`running job ${jobRef.id}, step ${step} `);
    if (step > scheduleTask.length) {
      log(`no more steps to run in job ${jobRef.id}`);
      return;
    }
    // Step is indexed from 1, need to substract 1 to get the correct array index
    const stepDetails = scheduleTask.sort(
      (first, second) => first.step - second.step,
    )[step - 1];
    const {
      delayAfter,
      // task: { process, inputs, softTimeout, hardTimeout, name },
    } = stepDetails as ScheduleTask;
    //
    await sleep(20000);
    jobRef.step = step + 1;
    jobRef.save();

    await sleep(delayAfter);
    await innerRun();
  };

  try {
    if (job.schedule.scheduleTask.length === 0) {
      throw new Error("No tasks defined for this schedule.");
    }

    // TODO: delete
    a.on("stop", () => {
      log(`stop job ${jobRef.id}`);
      throw new Error("Stop");
    });
    //

    await innerRun();
    jobRef.status = "finished";
    jobRef.endTime = new Date();
    await jobRef.save();
  } catch (error) {
    log(error.message);
    jobRef.message = error.message;
    jobRef.status = "failed";
    jobRef.endTime = new Date();
    await jobRef.save();
  } finally {
    const jobLog = JobLog.create({
      ...jobRef,
      runtimeResourceId: jobRef.runtimeResource.id,
      scheduleId: jobRef.schedule.id,
    });

    await jobLog.save();
    runningJobRef.splice(
      runningJobRef.findIndex((el) => el.job.id === a.job.id),
    );
    await jobRef.remove();
  }
};

export const getJobs = async (
  condition?: Partial<Job> | Partial<Job>[],
): Promise<Job[]> => {
  if (condition) {
    return Job.find({ where: condition });
  }
  return Job.find();
};

/**
 * Starts queued jobs on free resources. In case of first run, it will try to restart previously running jobs (e.g. after app crash).
 */
export const startIfAvailable = async (): Promise<void> => {
  if (checking) {
    // Return immediately if the function is already running. This is to prevent accidentally starting multiple jobs on one resource.
    return;
  }
  try {
    checking = true;
    const jobs = await getJobs([{ status: "running" }, { status: "waiting" }]);
    if (jobs.length === 0) {
      return;
    }
    const uniqueResources = getResourcesFromJobs(jobs);
    // eslint-disable-next-line no-restricted-syntax
    for (const id of uniqueResources) {
      if (firstRun || isResourceFree(id, jobs)) {
        const thisResourceJobs = filterByResource(id, jobs);
        const runningJobs = filterByStatus("running", thisResourceJobs);
        const waitingJobs = filterByStatus("waiting", thisResourceJobs);
        let job: Job | undefined;
        if (runningJobs.length === 0) {
          [job] = orderByPriority(waitingJobs);
        } else {
          [job] = orderByPriority(runningJobs);
        }
        if (job) {
          job.status = "running";
          job.startTime = new Date();
          // eslint-disable-next-line no-await-in-loop
          await job.save();
          // Do not await the result
          run(job);
        }
      }
    }
  } catch (error) {
    //
  } finally {
    firstRun = false;
    checking = false;
  }
};

// const softStopJob = () => {};

// const hardStopJob = () => {};

// TODO: delete
setInterval(() => {
  log(runningJobRef);
  if (runningJobRef.length > 0) {
    if (Math.floor(Math.random() * 100) > 90) {
      log(`stop job test ${runningJobRef[0]?.job.id}`);

      runningJobRef[0]?.emit("stop");
    }
  }
}, 2000);
