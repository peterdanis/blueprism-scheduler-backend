import { JobRef, run } from "./run";
import { checkInterval } from "../setting";
import Job from "../../entities/Job";
import log from "../../utils/logger";
import retry from "../../utils/retry";
import Schedule from "../../entities/Schedule";
import { transferJob } from "../jobLog";
import User from "../../entities/User";

let checking = false;
let firstRun = true;
let runningJobRef: JobRef[] = [];

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
export const addJob = async (
  schedule: Schedule,
  startReason: string,
): Promise<Job> => {
  const { id, rule, priority, runtimeResource } = schedule;

  const job = Job.create({
    addTime: new Date(),
    priority,
    runtimeResource,
    schedule,
    startReason,
    status: "waiting",
  });
  log.info("Adding schedule jobs", {
    rule,
    scheduleId: id,
  });
  return retry(() => job.save());
};

/**
 * Returns all jobs, or selection of jobs based on search criteria.
 */
export const getJobs = async (
  condition?: Partial<Job> | Partial<Job>[],
): Promise<Job[]> => {
  if (condition) {
    return Job.find({ where: condition });
  }
  return Job.find();
};

/**
 * Transfers the job to jobLog if its not running or tries to hard/soft stop the job
 */
export const stopJob = async (
  id: number,
  user: Partial<User>,
  hardStop?: boolean,
): Promise<void> => {
  const jobs = await getJobs();
  const [job] = jobs.filter((_job) => _job.id === id);
  if (job && job.status === "waiting") {
    job.status = "canceled";
    await transferJob(job, `Canceled by userId:${user.id}, name:${user.name}`);
  }
  if (job && job.status === "running") {
    const [jobRef] = runningJobRef.filter(
      (_jobRef) => _jobRef.job.id === job.id,
    );
    if (hardStop) {
      jobRef?.emit("jobHardStop", user);
    } else {
      jobRef?.emit("jobSoftStop", user);
    }
  }
};

/**
 * Starts queued jobs on free resources. In case of first run, it will try to clear any outstanding jobs and restart previously running jobs (e.g. after app crash).
 */
export const startIfAvailable = async (): Promise<void> => {
  if (checking) {
    // Return immediately if the function is already running. This is to prevent accidentally starting multiple jobs on one resource.
    return;
  }
  try {
    checking = true;
    // Check jobRef array for items marked for deletion
    runningJobRef = runningJobRef.filter((jobRef) => !jobRef.delete);

    // Clear any outstanding jobs on first run
    if (firstRun) {
      const jobsToClear = await getJobs([
        { status: "failed" },
        { status: "finished" },
        { status: "finished with notes" },
        { status: "stopped" },
        { status: "canceled" },
      ]);
      // eslint-disable-next-line no-restricted-syntax
      for (const job of jobsToClear) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await transferJob(job, "Cleared at startup");
        } catch (error) {
          log.error("Cleared at startup", { jobId: job.id });
        }
      }
    }

    // Re-start running jobs or start new if free
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-await-in-loop
          await retry(() => job!.save());
          const jobRef = run(job);
          runningJobRef.push(jobRef);
        }
      }
    }
  } catch (error) {
    log.error(error.message, { error: error.response.data });
  } finally {
    firstRun = false;
    checking = false;
  }
};

export const startPeriodicCheck = (): NodeJS.Timeout => {
  const interval = setInterval(async () => {
    await startIfAvailable();
  }, checkInterval);
  return interval;
};
