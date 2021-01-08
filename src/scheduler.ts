import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./utils/getEnvVariable";
import { createConnection } from "typeorm";
import Instruction from "./entity/Instruction";
import Job from "./entity/Job";
import log from "./utils/logger";
import RuntimeResource from "./entity/RuntimeResource";
import Schedule from "./entity/Schedule";
import ScheduleInstruction from "./entity/ScheduleInstruction";
import { scheduleJob } from "node-schedule";
import User from "./entity/User";

export const init = async (): Promise<void> => {
  try {
    await createConnection({
      database: dbName,
      entities: [
        User,
        RuntimeResource,
        Instruction,
        Job,
        Schedule,
        ScheduleInstruction,
      ],
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
      const { id, rule, priority, runtimeResource } = schedule;
      scheduleJob(
        id.toString(),
        rule,
        async (): Promise<Job> => {
          const job = Job.create({
            priority,
            runtimeResource,
            schedule,
            startTime: Date.now(),
            status: "waiting",
          });
          return job.save();
        },
      );
    });
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
