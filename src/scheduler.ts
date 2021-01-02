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
import log from "./utils/logger";
import Queue from "./entities/Queue";
import RuntimeResource from "./entities/RuntimeResource";
import Schedule from "./entities/Schedule";
import User from "./entities/User";

export const init = async (): Promise<void> => {
  try {
    await createConnection({
      database: dbName,
      entities: [User, RuntimeResource, Instruction, Queue, Schedule],
      host: dbHost,
      logging: "all",
      password: dbPassword,
      port: dbPort,
      synchronize: true,
      type: "mssql",
      username: dbUsername,
    });
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
