import { Job as NodeSchedule, scheduledJobs, scheduleJob } from "node-schedule";
import { addJob } from "./job";
import Job from "../entities/Job";
import { parseExpression } from "cron-parser";
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
  const { id, rule, timezone, validFrom, validUntil } = schedule;
  scheduleJob(
    id.toString(),
    { end: validUntil, rule, start: validFrom, tz: timezone },
    async (): Promise<Job> => {
      return addJob(schedule, "scheduler");
    },
  );
};

export const deleteSchedule = async (
  id: number,
): Promise<Schedule | undefined> => {
  const schedule = await getSchedule(id);
  const scheduleRef = getScheduleRef(id);
  if (scheduleRef) {
    scheduleRef.cancel();
  }
  await schedule?.remove();
  clearScheduleCache();
  return schedule;
};

export const updateSchedule = async (schedule: Schedule): Promise<Schedule> => {
  clearScheduleCache();
  await schedule.save();
  const scheduleRef = getScheduleRef(schedule.id);
  if (scheduleRef) {
    scheduleRef.cancel();
  }
  registerSchedule(schedule);
  return schedule;
};

export const addSchedule = async (
  scheduleLikeObject: Partial<Schedule>,
): Promise<Schedule> => {
  clearScheduleCache();
  if (!scheduleLikeObject.rule) {
    throw new Error("Rule not defined");
  }
  parseExpression(scheduleLikeObject.rule);
  const schedule = Schedule.create(scheduleLikeObject);
  await schedule.save();
  registerSchedule(schedule);
  return schedule;
};

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
