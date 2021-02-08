import Job from "../entity/Job";
import JobLog from "../entity/JobLog";
import log from "../utils/logger";
import retry from "../utils/retry";

export const transferJob = async (
  job: Job,
  message: string,
): Promise<JobLog> => {
  const { id, schedule, runtimeResource } = job;
  const jobLog = JobLog.create({
    ...job,
    // id: undefined,
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

export const getJobLogs = async (): Promise<void> => {
  //
};
