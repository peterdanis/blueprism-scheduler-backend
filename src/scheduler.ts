import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./utils/getEnvVariables";
import { createConnection } from "typeorm";
import Instruction from "./entities/Instruction";
import Job from "./entities/Job";
import log from "./utils/logger";
import RuntimeResource from "./entities/RuntimeResource";
import Schedule from "./entities/Schedule";
import ScheduleInstruction from "./entities/ScheduleInstruction";
import User from "./entities/User";

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
      synchronize: true,
      type: "mssql",
      username: dbUsername,
    });
    log(`Connected to: ${dbHost}, database: ${dbName}`);
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
