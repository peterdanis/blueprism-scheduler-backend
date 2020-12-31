import dotenv from "dotenv";

dotenv.config();

export const apiAuth = process.env.BP_SCHED_AUTH;
export const apiIP = process.env.BP_SCHED_IP;
export const apiPassword = process.env.BP_SCHED_AUTH_PASSWORD;
export const apiPort = process.env.BP_SCHED_PORT;
export const apiUsername = process.env.BP_SCHED_AUTH_USERNAME;
export const certFile = process.env.BP_SCHED_CERT_FILE_NAME;
export const certPassword = process.env.BP_SCHED_CERT_PW;
export const dbHost = process.env.BP_SCHED_DBHOST;
export const dbName = process.env.BP_SCHED_DBNAME;
export const dbPassword = process.env.BP_SCHED_DBPASSWORD;
export const dbUsername = process.env.BP_SCHED_DBUSERNAME;
export const useHTTPS = process.env.BP_SCHED_HTTPS;
export const dbPort = process.env.BP_SCHED_DBPORT
  ? parseInt(process.env.BP_SCHED_DBPORT, 10)
  : 1433;
