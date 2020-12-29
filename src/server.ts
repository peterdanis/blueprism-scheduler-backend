import { name as appName, version } from "../package.json";
import { AddressInfo } from "net";
import app from "./app";
import Debug from "debug";
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import https from "https";
import scheduler from "./scheduler";

dotenv.config();
const debug = Debug(`express:${appName}`);
const {
  BP_SCHED_AUTH,
  BP_SCHED_AUTH_USERNAME,
  BP_SCHED_AUTH_PASSWORD,
  BP_SCHED_CERT_FILE_NAME,
  BP_SCHED_CERT_PW,
  BP_SCHED_HTTPS,
  BP_SCHED_IP,
  BP_SCHED_PORT,
  BP_SCHED_DBNAME,
  BP_SCHED_DBHOST,
  BP_SCHED_DBPORT,
  BP_SCHED_DBUSERNAME,
  BP_SCHED_DBPASSWORD,
  NODE_ENV,
} = process.env;
let server: http.Server;
let log: Debug.Debugger | Console["log"];

// Use console.log if not debugging
if (debug.enabled) {
  log = debug;
} else {
  log = console.log; // eslint-disable-line no-console
}

// Print out some info
log(" ");
log(`UTC start time: ${new Date(Date.now()).toISOString()}`);
log(`Version: ${version}`);
log(`Env: ${NODE_ENV}`);
log(`Auth: ${BP_SCHED_AUTH}`);
log(
  "Note: configuration can be done via .env file in this directory and/or via env variables",
);

// Checks
if (BP_SCHED_AUTH === "basic") {
  if (!BP_SCHED_AUTH_USERNAME || !BP_SCHED_AUTH_PASSWORD) {
    log(
      "Error: API authentication username or password are not set. Please set them in .env file",
    );
    process.exit(1);
  }
} else {
  log(
    "Warning: API authentication not set. Do not use the API without ani authentication in production",
  );
}
if (
  !BP_SCHED_DBNAME ||
  !BP_SCHED_DBUSERNAME ||
  !BP_SCHED_DBPASSWORD ||
  !BP_SCHED_DBHOST ||
  !BP_SCHED_DBPORT
) {
  log(
    "Error: Scheduler database connection settings are not set. Please set them in .env file",
  );
  process.exit(1);
}

// Create HTTP or HTTPS server.
if (BP_SCHED_HTTPS === "true") {
  if (!BP_SCHED_CERT_FILE_NAME) {
    log(
      "Error: Generate self signed certificate, set correct cert path in .env file (or env variable) or switch to non-secure HTTP instead of HTTPS in .env file (or env variable).",
    );
    process.exit(1);
  }
  try {
    const options = {
      passphrase: BP_SCHED_CERT_PW,
      pfx: fs.readFileSync(BP_SCHED_CERT_FILE_NAME), // eslint-disable-line security/detect-non-literal-fs-filename
    };
    server = https.createServer(options, app);
  } catch (error) {
    if (error.message === "mac verify failure") {
      log(
        "Error: Please check whether certificate password stored in .env (or env variable) file is correct",
      );
    } else if (error.code === "ENOENT") {
      log(
        `Error: ${error.message}. Generate self signed certificate, set correct cert path in .env file (or env variable) or switch to non-secure HTTP instead of HTTPS in .env file (or env variable).`,
      );
    } else {
      log(`Error: ${error.message}`);
    }
    process.exit(1);
  }
} else {
  server = http.createServer(app);
  log("Warning: Using HTTPS over HTTP is highly recommended in production");
}

server.on("error", (error) => {
  log(error);
});
server.on("listening", () => {
  const addr = server.address() as AddressInfo;
  log(
    `Listening on ${addr.family} address ${BP_SCHED_IP}, port ${
      addr.port
    }, using ${BP_SCHED_HTTPS ? "HTTPS" : "HTTP"}`,
  );
  scheduler(
    BP_SCHED_DBNAME as string,
    BP_SCHED_DBUSERNAME as string,
    BP_SCHED_DBPASSWORD as string,
    BP_SCHED_DBHOST as string,
    parseInt(BP_SCHED_DBPORT as string, 10),
  );
});

server.listen(BP_SCHED_PORT);

module.exports = server;
