import "reflect-metadata";
import { addJob, startIfAvailable } from "./controller/job";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./utils/getEnvVariable";
import { createConnection } from "typeorm";
import Job from "./entity/Job";
import log from "./utils/logger";
import RuntimeResource from "./entity/RuntimeResource";
import Schedule from "./entity/Schedule";
import { scheduleJob } from "node-schedule";
import ScheduleTask from "./entity/ScheduleTask";
import Task from "./entity/Task";
import User from "./entity/User";

export const init = async (): Promise<void> => {
  try {
    await createConnection({
      database: dbName,
      entities: [User, RuntimeResource, Task, Job, Schedule, ScheduleTask],
      host: dbHost,
      logging: ["error", "warn"],
      password: dbPassword,
      port: dbPort,
      type: "mssql",
      username: dbUsername,
    });
    log(`Connected to: ${dbHost}, database: ${dbName}`);

    const schedules = await Schedule.find();
    schedules.forEach((schedule) => {
      const { id, rule } = schedule;
      scheduleJob(
        id.toString(),
        rule,
        async (): Promise<Job> => {
          return addJob(schedule);
        },
      );
    });
  } catch (error) {
    log(error);
  }
};

setInterval(async () => {
  try {
    await startIfAvailable();
  } catch (error) {
    log(error);
  }
}, 5000);

export const dummy = "dummy";
