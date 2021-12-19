import Job from "../entities/Job";
import JobLog from "../entities/JobLog";
import log from "../utils/logger";
import retry from "../utils/retry";

let jobLogsCache: JobLog[] | undefined;

export const transferJob = async (
  job: Job,
  message: string,
): Promise<JobLog> => {
  jobLogsCache = undefined;
  const { id, schedule, runtimeResource } = job;
  const jobLog = JobLog.create({
    ...job,
    id: undefined,
    jobId: id,
    message,
    runtimeResourceId: runtimeResource.id,
    scheduleId: schedule.id,
  });
  await retry(() => jobLog.save());
  log.info("Job transferred", { jobId: id, jobLogId: jobLog.id });
  await retry(() => job.remove());
  return jobLog;
};

export const getJobLogs = async (): Promise<JobLog[]> => {
  if (!jobLogsCache) {
    jobLogsCache = await JobLog.find();
  }
  return jobLogsCache;
};
