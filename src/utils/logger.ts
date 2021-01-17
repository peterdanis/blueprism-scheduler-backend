import { createLogger, format, transports } from "winston";

const { combine, timestamp, json } = format;

const logger = createLogger({
  format: combine(timestamp(), json()),
  level: "info",

  transports: [new transports.Console()],
});

export default logger;
