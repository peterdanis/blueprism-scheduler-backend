import Job from "../entity/Job";
import log from "../utils/logger";
import Schedule from "../entity/Schedule";

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

const removeJob = () => {};

const softStopJob = () => {};

const hardStopJob = () => {};
