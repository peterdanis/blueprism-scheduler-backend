import dummyData from "./dummyData.json";
import RuntimeResource from "../../src/entity/RuntimeResource";
import Schedule from "../../src/entity/Schedule";
import ScheduleTask from "../../src/entity/ScheduleTask";
import Task from "../../src/entity/Task";
import User from "../../src/entity/User";

/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
const users = async (): Promise<void> => {
  for (const user of dummyData.user) {
    const _user = User.create(user);
    await _user.save();
  }
};

const runtimeResources = async (): Promise<void> => {
  for (const runtimeResource of dummyData.runtimeResource) {
    const _runtimeResource = RuntimeResource.create(
      runtimeResource as RuntimeResource,
    );
    await _runtimeResource.save();
  }
};

const tasks = async (): Promise<void> => {
  for (const task of dummyData.task) {
    const _task = Task.create(task as Task);
    await _task.save();
  }
};

const schedules = async (): Promise<void> => {
  for (const schedule of dummyData.schedule) {
    const runtimeResource = await RuntimeResource.findOne({
      where: { friendlyName: schedule.runtimeResource },
    });
    const validFrom = new Date("2020-12-31T20:00:00Z");
    const _schedule = Schedule.create(
      Object.assign(schedule, { runtimeResource, validFrom }),
    );
    await _schedule.save();
  }
};

const scheduleTasks = async (): Promise<void> => {
  for (const scheduleTask of dummyData.scheduleTask) {
    const schedule = await Schedule.findOne({
      where: { name: scheduleTask.schedule },
    });
    const task = await Task.findOne({ where: { name: scheduleTask.task } });
    const _scheduleTask = ScheduleTask.create(
      Object.assign(scheduleTask, { schedule, task }),
    );
    await _scheduleTask.save();
  }
};

export default async (): Promise<void> => {
  await users();
  await runtimeResources();
  await schedules();
  await tasks();
  await scheduleTasks();
};
