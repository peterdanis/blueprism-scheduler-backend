import { apiAuth, apiIP, apiPort, useHTTPS } from "./utils/getEnvVariables";
import { AddressInfo } from "net";
import app from "./api";
import createServer from "./utils/createServer";
import log from "./utils/logger";
import { init as schedulerInit } from "./scheduler";
import { version } from "../package.json";

// Print out some info
log(" ");
log(`UTC start time: ${new Date(Date.now()).toISOString()}`);
log(`Version: ${version}`);
log(`Auth: ${apiAuth}`);
log(
  "Note: configuration can be done via .env file in this directory and/or via env variables",
);

// Create HTTP or HTTPS server, based on env. variable
const server = createServer(app);
server.on("error", (error) => {
  log(error);
});
server.on("listening", async () => {
  const addr = server.address() as AddressInfo;
  log(
    `Listening on ${addr.family} address ${apiIP}, port ${addr.port}, using ${
      useHTTPS ? "HTTPS" : "HTTP"
    }`,
  );

  await schedulerInit();
});

server.listen(apiPort);

module.exports = server;
