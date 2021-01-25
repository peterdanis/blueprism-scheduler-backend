import { ConnectionOptions } from "typeorm";
import schedDbConfig from "../src/utils/connection";

const config: ConnectionOptions = {
  ...schedDbConfig,
  database: ":memory:",
  logger: "simple-console",
  logging: false,
  migrations: [],
  synchronize: true,
  type: "sqlite",
};

export default config;
