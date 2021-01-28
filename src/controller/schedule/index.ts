import { Job as NodeSchedule, scheduledJobs, scheduleJob } from "node-schedule";
import { addJob } from "../job";
import Job from "../../entity/Job";
import Schedule from "../../entity/Schedule";

// TODO: check start and end date/time before adding to jobs
export const registerSchedule = (schedule: Schedule): void => {
  const { id, rule, validFrom, validUntil } = schedule;
  scheduleJob(
    id.toString(),
    { end: validUntil, rule, start: validFrom },
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
  // Only run once at start
  if (schedulesRegistered) {
    return;
  }

  const schedules = await Schedule.find();
  schedules.forEach(registerSchedule);
  schedulesRegistered = true;
};
