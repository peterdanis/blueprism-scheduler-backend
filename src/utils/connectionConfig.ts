import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./getEnvVariable";
import Job from "../entities/Job";
import JobLog from "../entities/JobLog";
import path from "path";
import RuntimeResource from "../entities/RuntimeResource";
import Schedule from "../entities/Schedule";
import ScheduleTask from "../entities/ScheduleTask";
import { SqlServerConnectionOptions } from "typeorm/driver/sqlserver/SqlServerConnectionOptions";
import Task from "../entities/Task";
import typeOrmLogger from "./typeOrmLogger";
import User from "../entities/User";

const migrationDir = path.join(__dirname, "..", "migrations");

const schedDbConfig: SqlServerConnectionOptions = {
  cli: { migrationsDir: "/src/migrations/" },
  database: dbName,
  entities: [Job, JobLog, RuntimeResource, Schedule, ScheduleTask, Task, User],
  host: dbHost,
  logger: typeOrmLogger,
  migrations: [`${migrationDir}/*`],
  migrationsRun: true,
  options: { enableArithAbort: true },
  password: dbPassword,
  port: dbPort,
  type: "mssql",
  username: dbUsername,
};

// Export scheduler DB config as default, for typeorm cli to work (e.g. for generating migrationts)
export default schedDbConfig;
