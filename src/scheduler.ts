import { addJob, startIfAvailable } from "./controller/job";
import { checkInterval } from "./utils/getSetting";
import { createSchedulerDBConnection } from "./utils/connection";
import Job from "./entity/Job";
import log from "./utils/logger";
import Schedule from "./entity/Schedule";
import { scheduleJob } from "node-schedule";

export const init = async (): Promise<void> => {
  try {
    await createSchedulerDBConnection();

    // TODO: check start and end date/time before adding to jobs
    const schedules = await Schedule.find();
    schedules.forEach((schedule) => {
      const { id, rule } = schedule;
      scheduleJob(
        id.toString(),
        rule,
        async (): Promise<Job> => {
          return addJob(schedule, "scheduler");
        },
      );
    });

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

export const dummy = "dummy";
