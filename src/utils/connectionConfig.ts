import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./getEnvVariable";
import Job from "../entity/Job";
import JobLog from "../entity/JobLog";
import path from "path";
import RuntimeResource from "../entity/RuntimeResource";
import Schedule from "../entity/Schedule";
import ScheduleTask from "../entity/ScheduleTask";
import { SqlServerConnectionOptions } from "typeorm/driver/sqlserver/SqlServerConnectionOptions";
import Task from "../entity/Task";
import typeOrmLogger from "./typeOrmLogger";
import User from "../entity/User";

const migrationDir = path.join(__dirname, "..", "migration");

const schedDbConfig: SqlServerConnectionOptions = {
  cli: { migrationsDir: "/src/migration/" },
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
