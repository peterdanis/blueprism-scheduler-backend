import { apiIP, apiPort, useHTTPS } from "./utils/getEnvVariable";
import { AddressInfo } from "net";
import app from "./api";
import createServer from "./utils/createServer";
import log from "./utils/logger";
import { init as schedulerInit } from "./scheduler";
import { version } from "../package.json";

// Print out some info
log.info(" ");
log.info(`UTC start time: ${new Date(Date.now()).toISOString()}`);
log.info(`Version: ${version}`);
log.info(
  "Note: configuration can be done via .env file in this directory and/or via env variables",
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

  await schedulerInit();
});

server.listen(apiPort);

module.exports = server;
