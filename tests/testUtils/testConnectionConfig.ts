import { ConnectionOptions } from "typeorm";
import schedDbConfig from "../../src/utils/connectionConfig";

const config: ConnectionOptions = {
  ...schedDbConfig,
  cli: { migrationsDir: "./tests/testUtils/migration/" },
  database: ":memory:",
  logger: "simple-console",
  logging: false,
  migrations: ["./tests/testUtils/migration/*"],
  migrationsRun: true,
  type: "sqlite",
};

export default config;
