import Job from "../entity/Job";
import log from "../utils/logger";
import Schedule from "../entity/Schedule";
import ScheduleTask from "../entity/ScheduleTask";
import { v4 as uuid } from "uuid";

let checking = false;
let firstRun = true;
const runningJobs: Job[] = [];

/**
 * Returns array of unique resource ids found in given job array
 */
const getResourcesFromJobs = (jobs: Job[]): number[] => {
  const reducer = (
    jobArr: number[],
    { runtimeResource: { id } }: Job,
  ): number[] => {
    if (jobArr.includes(id)) {
      return jobArr;
    }
    return [id, ...jobArr];
  };
  return jobs.reduce(reducer, []);
};

/**
 * Sorts jobs by priority, from lowest to highest. Jobs with lower priority should go first.
 */
const orderByPriority = (jobs: Job[]): Job[] => {
  return jobs.sort((first, second) => first.priority - second.priority);
};

const filterByResource = (id: number, jobs: Job[]): Job[] => {
  return jobs.filter(({ runtimeResource }) => runtimeResource.id === id);
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
  log(`Adding job with id ${id} and rule ${rule} to jobs`);

  const job = Job.create({
    addTime: new Date(),
    priority,
    runtimeResource,
    schedule,
    status: "waiting",
  });
  return job.save();
};

const run = async (job: Job): Promise<void> => {
  try {
    const {
      sessionId,
      step,
      subStep,
      runtimeResource: { id },
      schedule: { scheduleTask },
    } = job;
    // Step is indexed from 1, need to substract 1 to get the correct array index
    if (scheduleTask.length === 0) {
      return;
    }
    const stepDetails = scheduleTask.sort(
      (first, second) => first.step - second.step,
    )[step - 1];
    const {
      delayAfter,
      task: { process, inputs, softTimeout, hardTimeout, name },
    } = stepDetails as ScheduleTask;
    log(`Send request to resource ${id}`);
    throw new Error("test");
  } catch (error) {
    log(error);
    job.message = error.message;
    job.status = "failed";
    job.endTime = new Date();
    await job.save();
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
    const jobs = await getJobs(
      firstRun ? { status: "running" } : { status: "waiting" },
    );
    log(jobs);
    if (jobs.length === 0) {
      return;
    }
    const uniqueResources = getResourcesFromJobs(jobs);
    // eslint-disable-next-line no-restricted-syntax
    for (const id of uniqueResources) {
      // uniqueResources.forEach((id) => {
      if (firstRun || isResourceFree(id, jobs)) {
        const filteredJobs = filterByResource(id, jobs);
        const job = orderByPriority(filteredJobs)[0];
        if (job) {
          job.status = "running";
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
