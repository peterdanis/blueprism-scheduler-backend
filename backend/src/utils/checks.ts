import {
  apiAuth,
  apiPassword,
  apiUsername,
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./getEnvVariable";
import log from "./logger";

export default (): void => {
  if (apiAuth === "basic") {
    if (!apiUsername || !apiPassword) {
      log.error(
        "Error: API authentication username or password are not set. Please set them in .env file",
      );
      process.exit(1);
    }
  } else {
    log.warn(
      "Warning: API authentication not set. Do not use the API without ani authentication in production",
    );
  }
  if (!dbName || !dbUsername || !dbPassword || !dbHost || !dbPort) {
    log.error(
      "Error: Scheduler database connection settings are not set. Please set them in .env file",
    );
    process.exit(1);
  }
};
