import { Connection } from "typeorm";
import log from "../src/utils/logger";
import retry from "async-retry";

export default async (connection: Connection): Promise<void> => {
  try {
    const queryRunner = connection.createQueryRunner();

    const tables: string[] = [
      "schedule_task",
      "user",
      "task",
      "schedule",
      "runtime_resource",
      "job",
      "job_log",
    ];

    await Promise.all(
      tables.map(async (table) => {
        await retry(
          async () => {
            await queryRunner.dropTable(table, true, false);
            log.info(`Deleting ${table} successful`);
          },
          {
            factor: 1.5,
            onRetry: () => {
              log.info(`Retrying to delete table ${table}`);
            },
            retries: 6,
          },
        ).catch(() => {
          // do nothing
        });
      }),
    );

    log.info("DB cleared");
  } catch (error) {
    log.error(error);
  }
};
