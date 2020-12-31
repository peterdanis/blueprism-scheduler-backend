import { version } from "../package.json";
import { AddressInfo } from "net";
import app from "./api";
import log from "./utils/logger";
import { apiAuth } from "./utils/getEnvVariables";
import createServer from "./utils/createServer";

import scheduler from "./scheduler";

// const { apiAuth} = env;

// Print out some info
log(" ");
log(`UTC start time: ${new Date(Date.now()).toISOString()}`);
log(`Version: ${version}`);
log(`Auth: ${apiAuth}`);
log(
  "Note: configuration can be done via .env file in this directory and/or via env variables",
);

// Create HTTP or HTTPS server.
const server = createServer(app);
server.on("error", (error) => {
  log(error);
});
server.on("listening", async () => {
  const addr = server.address() as AddressInfo;
  log(
    `Listening on ${addr.family} address ${BP_SCHED_IP}, port ${
      addr.port
    }, using ${BP_SCHED_HTTPS ? "HTTPS" : "HTTP"}`,
  );

  await scheduler(
    BP_SCHED_DBNAME,
    BP_SCHED_DBUSERNAME,
    BP_SCHED_DBPASSWORD,
    BP_SCHED_DBHOST,
    parseInt(BP_SCHED_DBPORT, 10),
  );
});

server.listen(BP_SCHED_PORT);

module.exports = server;
