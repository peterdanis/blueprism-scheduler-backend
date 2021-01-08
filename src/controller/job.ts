import Job from "../entity/Job";
import log from "../utils/logger";
import Schedule from "../entity/Schedule";

let checking = false;

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

const orderByPriority = (jobs: Job[]): Job[] => {
  return jobs.sort((first, second) => {
    if (first.priority < second.priority) {
      return -1;
    }
    if (first.priority > second.priority) {
      return 1;
    }
    return 0;
  });
};

const filterByResource = (id: number, jobs: Job[]): Job[] => {
  return jobs.filter(({ runtimeResource }) => runtimeResource.id === id);
};

const isResourceFree = (id: number, jobs: Job[]): boolean => {
  return (
    filterByResource(id, jobs).filter(({ status }) => status === "running")
      .length === 0
  );
};

const run = (job: Job) => {};

export const getJobs = async (): Promise<Job[]> => {
  return Job.find();
};

export const startIfAvailable = async (): Promise<void> => {
  if (checking) {
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

// const removeJob = () => {};

// const softStopJob = () => {};

// const hardStopJob = () => {};
