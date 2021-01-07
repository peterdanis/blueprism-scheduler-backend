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
      logging: "all", //["error", "warn"],
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
