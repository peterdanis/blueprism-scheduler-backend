import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "../src/utils/getEnvVariable";
import { createConnection } from "typeorm";
import log from "../src/utils/logger";
import retry from "async-retry";

export default (async () => {
  let connection;
  try {
    connection = await createConnection({
      database: dbName,
      host: dbHost,
      logging: false,
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

    await Promise.all(
      tables.map(async (table) => {
        await retry(
          async () => {
            await queryRunner.dropTable(table);
          },
          {
            factor: 1,
            onRetry: () => {
              log(`retrying to delete table ${table}`);
            },
            retries: 3,
          },
        ).catch(() => {
          // do nothing
        });
      }),
    );

    log("DB cleared");
  } catch (error) {
    log(error);
  } finally {
    connection?.close();
  }
})();
