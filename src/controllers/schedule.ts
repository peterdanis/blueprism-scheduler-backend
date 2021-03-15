import { Job as NodeSchedule, scheduledJobs, scheduleJob } from "node-schedule";
import { addJob } from "./job";
import Job from "../entities/Job";
import Schedule from "../entities/Schedule";

let schedulesCache: Schedule[] | undefined;

export const clearScheduleCache = (): void => {
  schedulesCache = undefined;
};

export const getScheduleRef = (id: number): NodeSchedule | undefined =>
  scheduledJobs[id.toString()];

export const getSchedules = async (): Promise<Schedule[]> => {
  if (!schedulesCache) {
    schedulesCache = await Schedule.find();
  }
  return schedulesCache;
};

export const getSchedule = async (
  nameOrId: string | number,
): Promise<Schedule | undefined> => {
  const schedules = await getSchedules();
  const [schedule] = schedules.filter((_schedule) => {
    if (typeof nameOrId === "string") {
      return _schedule.name === nameOrId;
    }
    return _schedule.id === nameOrId;
  });
  return schedule;
};

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

export const updateSchedule = async (schedule: Schedule): Promise<Schedule> => {
  await schedule.save();
  const scheduleRef = getScheduleRef(schedule.id);
  scheduleRef?.cancel();
  registerSchedule(schedule);
  return schedule;
};

// export const addSchedule = (): Promise<Schedule> => {
//   //
// };

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
