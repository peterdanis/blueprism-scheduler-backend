import { Connection, createConnection } from "typeorm";
import { addJob } from "../../src/controller/job";
import config from "../testUtils/testConnectionConfig";
import Job from "../../src/entity/Job";
import JobLog from "../../src/entity/JobLog";
import loadDummies from "../testUtils/loadDummies";
import Schedule from "../../src/entity/Schedule";
import { transferJob } from "../../src/controller/jobLog";

jest.mock("../../src/utils/logger");

let connection: Connection;
let jobWithIdOne: Job;
let jobWithIdTwo: Job;

beforeAll(async () => {
  connection = await createConnection(config);
  await loadDummies();
  const schedules = await Schedule.find();
  jobWithIdOne = await addJob(schedules[0] as Schedule, "test");
  jobWithIdTwo = await addJob(schedules[1] as Schedule, "test");
});

afterAll(async () => {
  await connection.close();
});

test("A", async () => {
  await transferJob(jobWithIdTwo, "test");
  await transferJob(jobWithIdOne, "test");
  const [first, second] = await JobLog.find();
  expect(first?.jobId).toBe(2);
  expect(second?.jobId).toBe(1);
});
