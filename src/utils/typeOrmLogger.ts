import log from "./logger";
import { Logger } from "typeorm";

const typeOrmLogger: Logger = {
  log(level: "log" | "info" | "warn", message: string): void {
    switch (level) {
      case "warn":
        log.warn(message);
        break;
      default:
        log.info(message);
        break;
    }
  },

  logMigration(message: string): void {
    log.info(message);
  },
  logQuery(): void {
    // Dont want to log queries
  },

  logQueryError(error: string, query: string, parameters?: unknown[]): void {
    log.error(query, { error, parameters });
  },

  logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    log.warn(query, { parameters, time });
  },

  logSchemaBuild(message: string): void {
    log.info(message);
  },
};

export default typeOrmLogger;
