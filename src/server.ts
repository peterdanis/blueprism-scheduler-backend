import * as app from "./app";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import { name as appName, version } from "../package.json";
import { AddressInfo } from "net";
import { config } from "dotenv";
import Debug from "debug";

config();
const debug = Debug(`express:${appName}`);
const {
  BP_API_AUTH,
  BP_API_AUTH_PASSWORD,
  BP_API_AUTH_USERNAME,
  BP_API_CERT_FILE_NAME,
  BP_API_CERT_PW,
  BP_API_HTTPS,
  BP_API_IP,
  BP_API_PORT,
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
log(`Auth: ${BP_API_AUTH}`);
log(
  "Note: configuration can be done via .env file in this directory and/or via env variables",
);

// Checks
if (BP_API_AUTH === "basic") {
  if (!BP_API_AUTH_USERNAME || !BP_API_AUTH_PASSWORD) {
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

// Create HTTP or HTTPS server.
if (BP_API_HTTPS === "true") {
  if (!BP_API_CERT_FILE_NAME) {
    log(
      "Error: Generate self signed certificate, set correct cert path in .env file (or env variable) or switch to non-secure HTTP instead of HTTPS in .env file (or env variable).",
    );
    process.exit(1);
  }
  try {
    const options = {
      passphrase: BP_API_CERT_PW,
      pfx: fs.readFileSync(BP_API_CERT_FILE_NAME), // eslint-disable-line security/detect-non-literal-fs-filename
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
    `Listening on ${addr.family} address ${BP_API_IP}, port ${
      addr.port
    }, using ${BP_API_HTTPS ? "HTTPS" : "HTTP"}`,
  );
});

server.listen(BP_API_PORT);

module.exports = server;
