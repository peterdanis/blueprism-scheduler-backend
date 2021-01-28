import { addJob, startIfAvailable } from "../job";
import { Job as NodeSchedule, scheduledJobs, scheduleJob } from "node-schedule";
import { checkInterval } from "../../utils/getSetting";
import Job from "../../entity/Job";
import log from "../../utils/logger";
import Schedule from "../../entity/Schedule";

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

// export const updateSchedule = (schedule: Schedule): Promise<Schedule> => {
//   //
// };

// export const addSchedule = (): Promise<Schedule> => {
//   //
// };

export const getScheduleRef = (id: number): NodeSchedule | undefined =>
  scheduledJobs[id.toString()];

let schedulesRegistered = false;

export const registerExistingSchedules = async (): Promise<void> => {
  // Singleton
  if (schedulesRegistered) {
    return;
  }

  const schedules = await Schedule.find();
  schedules.forEach(registerSchedule);
  schedulesRegistered = true;

  setInterval(async () => {
    try {
      await startIfAvailable();
    } catch (error) {
      log.error(error);
    }
  }, checkInterval);
};
