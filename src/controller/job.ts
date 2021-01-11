import Job from "../entity/Job";
import log from "../utils/logger";
import Schedule from "../entity/Schedule";

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

const run = (job: Job) => {
  const { sessionId, step, subStep } = job;
};

export const getJobs = async (): Promise<Job[]> => {
  return Job.find();
};

export const startIfAvailable = async (): Promise<void> => {
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
        // As the jobs array is filtered by runtimeResourceId and it is free, its clear that there must be at least one item left in the array suitable for running
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
    priority,
    runtimeResource,
    schedule,
    startTime: new Date(),
    status: "waiting",
  });
  return job.save();
};

// const softStopJob = () => {};

// const hardStopJob = () => {};
