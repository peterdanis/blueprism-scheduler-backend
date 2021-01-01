import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./utils/getEnvVariables";
import { createConnection } from "typeorm";
import log from "./utils/logger";

export const init = async (): Promise<void> => {
  try {
    await createConnection({
      database: dbName,
      host: dbHost,
      logging: "all",
      password: dbPassword,
      port: dbPort,
      // synchronize: true,
      type: "mssql",
      username: dbUsername,
    });
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
