import { Connection, createConnection } from "typeorm";
import config from "./testUtils/testConnectionConfig";
import Job from "../src/entity/Job";
import loadDummies from "./testUtils/loadDummies";
import RuntimeResource from "../src/entity/RuntimeResource";
import Schedule from "../src/entity/Schedule";
import ScheduleTask from "../src/entity/ScheduleTask";
import Task from "../src/entity/Task";
import User from "../src/entity/User";

let connection: Connection;
let runtimeResource: RuntimeResource | undefined;
let schedule: Schedule | undefined;

beforeAll(async () => {
  connection = await createConnection(config);
  await loadDummies();
});

afterAll(async () => {
  await connection.close();
});

describe("User", () => {
  test("has expected properties", async () => {
    const users = await User.find();
    expect(users[0]).toMatchSnapshot();
  });
});

describe("RuntimeResource", () => {
  test("has expected properties", async () => {
    const runtimeResources = await RuntimeResource.find();
    [runtimeResource] = runtimeResources;
    expect(runtimeResource).toMatchSnapshot();
  });
});

describe("Schedule", () => {
  test("has expected properties", async () => {
    const schedules = await Schedule.find();
    [schedule] = schedules;
    expect(schedule).toMatchSnapshot();
  });
});

describe("Task", () => {
  test("has expected properties", async () => {
    const tasks = await Task.find();
    expect(tasks[0]).toMatchSnapshot();
  });
});

describe("ScheduleTask", () => {
  test("has expected properties", async () => {
    const scheduleTasks = await ScheduleTask.find();
    expect(scheduleTasks[0]).toMatchSnapshot();
  });
});

describe("Job", () => {
  test("has expected properties", async () => {
    const job = Job.create({
      addTime: new Date("2020-12-31T20:00:00Z"),
      runtimeResource,
      schedule,
      startReason: "test",
      status: "waiting",
      updateTime: new Date("2020-12-31T20:00:00Z"),
    });
    await job.save();
    const jobs = await Job.find();
    expect(jobs[0]).toMatchSnapshot();
  });
});
