import { certFile, certPassword, useHTTPS } from "./getEnvVariable";
import { Application } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import log from "./logger";

export default (app: Application): http.Server => {
  let server;

  if (useHTTPS === "true") {
    if (!certFile) {
      log.error(
        "Error: Generate self signed certificate, set correct cert path in .env file (or env variable) or switch to non-secure HTTP instead of HTTPS in .env file (or env variable).",
      );
      process.exit(1);
    }
    try {
      const options = {
        passphrase: certPassword,
        pfx: fs.readFileSync(certFile), // eslint-disable-line security/detect-non-literal-fs-filename
      };
      server = https.createServer(options, app);
    } catch (error) {
      if (error.message === "mac verify failure") {
        log.error(
          "Error: Please check whether certificate password stored in .env (or env variable) file is correct",
        );
      } else if (error.code === "ENOENT") {
        log.error(
          `Error: ${error.message}. Generate self signed certificate, set correct cert path in .env file (or env variable) or switch to non-secure HTTP instead of HTTPS in .env file (or env variable).`,
        );
      } else {
        log.error(`Error: ${error.message}`);
      }
      process.exit(1);
    }
  } else {
    server = http.createServer(app);
    log.warn(
      "Warning: Using HTTPS over HTTP is highly recommended in production",
    );
  }
  return server;
};
