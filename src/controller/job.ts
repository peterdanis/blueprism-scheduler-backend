import Job from "../entity/Job";

let checking = false;
let jobs: Job[] = [];

const updateJobs = async (): Promise<Job[]> => {
  jobs = await Job.find();
  return jobs;
};

// export const getJobs;

export const startIfAvailable = async (): Promise<void> => {
  if (checking) {
    return;
  }
  try {
    checking = true;
    const a = await updateJobs();
  } catch (error) {
    //
  } finally {
    checking = false;
  }
};

const isResourceFree = () => {};

const run = () => {};

const addJob = () => {};

const removeJob = () => {};

const softStopJob = () => {};

const hardStopJob = () => {};
