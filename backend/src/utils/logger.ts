import "winston-daily-rotate-file";
import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, json } = format;

const logger = createLogger({
  format: combine(timestamp(), json()),
  level: "info",
  // Use file transport when running as packaged app
  transports: process.pkg
    ? [
        new transports.DailyRotateFile({
          datePattern: "YYYY-MM-DD",
          dirname: path.join("logs"),
          extension: ".log",
          filename: "application",
          maxFiles: "60d",
          maxSize: "1m",
          utc: true,
        }),
      ]
    : [new transports.Console()],
});

export default logger;
