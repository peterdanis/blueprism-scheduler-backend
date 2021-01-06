import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "../src/utils/getEnvVariables";
import { createConnection } from "typeorm";
import log from "../src/utils/logger";

export default (async () => {
  let connection;
  try {
    connection = await createConnection({
      database: dbName,
      host: dbHost,
      logging: ["error", "warn"],
      password: dbPassword,
      port: dbPort,
      type: "mssql",
      username: dbUsername,
    });
    log(`Connected to: ${dbHost}, database: ${dbName}`);

    const queryRunner = connection.createQueryRunner();

    const tables: string[] = [
      "schedule_instruction",
      "user",
      "instruction",
      "schedule",
      "runtime_resource",
      "job",
    ];
    for (const table of tables) {
      const t = await queryRunner.getTable(table);
      if (t) {
        await queryRunner.dropTable(table);
      }
    }

    log("DB cleared");
  } catch (error) {
    log(error);
  } finally {
    connection?.close();
  }
})();
