import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./getEnvVariable";
import Job from "../entity/Job";
import JobLog from "../entity/JobLog";
import log from "./logger";
import RuntimeResource from "../entity/RuntimeResource";
import Schedule from "../entity/Schedule";
import ScheduleTask from "../entity/ScheduleTask";
import Task from "../entity/Task";
import User from "../entity/User";

export const createSchedulerDBConnection = async (): Promise<Connection> => {
  const connection = await createConnection({
    database: dbName,
    entities: [
      Job,
      JobLog,
      RuntimeResource,
      Schedule,
      ScheduleTask,
      Task,
      User,
    ],
    host: dbHost,
    logging: ["error", "warn"],
    options: { enableArithAbort: true },
    password: dbPassword,
    port: dbPort,
    type: "mssql",
    username: dbUsername,
  });
  log.info(`Connected to: ${dbHost}, database: ${dbName}`);
  return connection;
};

export const createBlueprismDBConnection = async (): Promise<Connection> => {
  const connection = await createConnection({
    database: dbName,
    entities: [],
    host: dbHost,
    logging: ["error", "warn"],
    password: dbPassword,
    port: dbPort,
    type: "mssql",
    username: dbUsername,
  });
  log.info(`Connected to: ${dbHost}, database: ${dbName}`);
  return connection;
};
