import Job from "../entity/Job";
import log from "../utils/logger";
import Schedule from "../entity/Schedule";
import ScheduleTask from "../entity/ScheduleTask";

let checking = false;
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

const run = async (job: Job): Promise<void> => {
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
};

export const getJobs = async (): Promise<Job[]> => {
  return Job.find();
};

export const startIfAvailable = async (): Promise<void> => {
  log(`checking: ${checking}`);
  if (checking) {
    // Return immediately if the function is already running. This is to prevent accidentally starting multiple jobs on one resource.
    return;
  }
  try {
    checking = true;
    const jobs = await getJobs();
    if (jobs.length === 0) {
      return;
    }
    const uniqueResources = getResourcesFromJobs(jobs);
    uniqueResources.forEach((id) => {
      if (isResourceFree(id, jobs)) {
        const filteredJobs = filterByResource(id, jobs);
        // As the jobs array is filtered by runtimeResourceId and it is free, its clear that there must be at least one item left in the array suitable for running.
        // Do not await the result
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        run(orderByPriority(filteredJobs)[0]!);
      }
    });
  } catch (error) {
    //
  } finally {
    checking = false;
  }
};

/**
 * Adds job to queue and return the reference to it.
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
    updateTime: new Date().toISOString(),
  });
  return job.save();
};

// const softStopJob = () => {};

// const hardStopJob = () => {};
