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
      "job-log",
    ];

    await Promise.all(
      tables.map(async (table) => {
        await retry(
          async () => {
            try {
              await queryRunner.dropTable(table);
            } catch (error) {
              if (!error.message.match(/Table .* does not exist/)) {
                throw error;
              }
            }
          },
          {
            factor: 1.5,
            onRetry: () => {
              log(`retrying to delete table ${table}`);
            },
            retries: 6,
          },
        ).catch(() => {
          // do nothing
        });
      }),
    );

    log("DB cleared");
  } catch (error) {
    log(error);
  }
};
