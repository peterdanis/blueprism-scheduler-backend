import { apiIP, apiPort, useHTTPS } from "./utils/getEnvVariable";
import { AddressInfo } from "net";
import app from "./api";
import { createConnection } from "typeorm";
import createServer from "./utils/createServer";
import log from "./utils/logger";
import { registerExistingSchedules } from "./controllers/schedule";
import retry from "./utils/retry";
import schedDbConfig from "./utils/connectionConfig";
import { startPeriodicCheck } from "./controllers/job";
import { version } from "../package.json";

// Print out some info
log.info(`Version: ${version}`);
log.info(
  "Configuration can be done via .env file in app directory and/or via env variables",
);

// Create HTTP or HTTPS server, based on env. variable
const server = createServer(app);
server.on("error", (error) => {
  log.error(error);
});
server.on("listening", async () => {
  const addr = server.address() as AddressInfo;
  log.info(
    `Listening on ${addr.family} address ${apiIP}, port ${addr.port}, using ${
      useHTTPS ? "HTTPS" : "HTTP"
    }`,
  );
  await retry(() => createConnection(schedDbConfig));
  log.info(
    `Connected to DB server: ${schedDbConfig.host}:${schedDbConfig.port}, database: ${schedDbConfig.database}`,
  );
  await registerExistingSchedules();
  startPeriodicCheck();
});

server.listen(apiPort);

export default server;
