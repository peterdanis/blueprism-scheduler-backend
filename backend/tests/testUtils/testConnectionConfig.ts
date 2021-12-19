import { ConnectionOptions } from "typeorm";
import schedDbConfig from "../../src/utils/connectionConfig";

const config: ConnectionOptions = {
  ...schedDbConfig,
  cli: { migrationsDir: "./tests/testUtils/migrations/" },
  database: ":memory:",
  logger: "simple-console",
  logging: false,
  migrations: ["./tests/testUtils/migrations/*"],
  migrationsRun: true,
  type: "sqlite",
};

export default config;
