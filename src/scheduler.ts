import { addJob, startIfAvailable } from "./controller/job";
import { Job as NodeSchedule, scheduledJobs, scheduleJob } from "node-schedule";
import { checkInterval } from "./utils/getSetting";
import { createSchedulerDBConnection } from "./utils/connection";
import Job from "./entity/Job";
import log from "./utils/logger";
import Schedule from "./entity/Schedule";

let initCalled = false;

// TODO: check start and end date/time before adding to jobs
export const registerSchedule = (schedule: Schedule): void => {
  const { id, rule } = schedule;
  scheduleJob(
    id.toString(),
    rule,
    async (): Promise<Job> => {
      return addJob(schedule, "scheduler");
    },
  );
};

export const getScheduleRef = (id: number): NodeSchedule | undefined =>
  scheduledJobs[id.toString()];

export const init = async (): Promise<void> => {
  if (initCalled) {
    return;
  }
  initCalled = true;

  try {
    await createSchedulerDBConnection();

    const schedules = await Schedule.find();
    schedules.forEach(registerSchedule);

    setInterval(async () => {
      try {
        await startIfAvailable();
      } catch (error) {
        log.error(error);
      }
    }, checkInterval);
  } catch (error) {
    log.error(error);
  }
};
