import Job from "../entity/Job";

let checking = false;
let jobs: Job[] = [];

const updateJobs = async (): Promise<Job[]> => {
  jobs = await Job.find({ order: { priority: "ASC" } });
  return jobs;
};

export const startIfAvailable = async (): Promise<void> => {
  if (checking) {
    return;
  }
  try {
    checking = true;
    await updateJobs();
  } catch (error) {
    //
  } finally {
    checking = false;
  }
};

const isResourceFree = () => {};

const run = () => {};

export const addJob = () => {};

const removeJob = () => {};

const softStopJob = () => {};

const hardStopJob = () => {};
