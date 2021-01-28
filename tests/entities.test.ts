import { Connection, createConnection } from "typeorm";
import config from "./other/connectionHelper";
import Job from "../src/entity/Job";
import RuntimeResource from "../src/entity/RuntimeResource";
import Schedule from "../src/entity/Schedule";
import ScheduleTask from "../src/entity/ScheduleTask";
import Task from "../src/entity/Task";
import User from "../src/entity/User";

let connection: Connection;

beforeAll(async () => {
  connection = await createConnection(config);
});

afterAll(async () => {
  await connection.close();
});

let runtimeResource: RuntimeResource;
let schedule: Schedule;
let task: Task;

describe("User", () => {
  test("has expected properties", async () => {
    const user = User.create({ name: "Test user" });
    await user.save();
    const users = await User.find();
    expect(users[0]).toMatchInlineSnapshot(`
      User {
        "admin": false,
        "id": 1,
        "name": "Test user",
      }
    `);
  });
});

describe("RuntimeResource", () => {
  test("has expected properties", async () => {
    runtimeResource = RuntimeResource.create({
      auth: "basic",
      friendlyName: "vm1",
      hostname: "vm1.domain.com",
      port: 3000,
    });
    await runtimeResource.save();
    const runtimeResources = await RuntimeResource.find();
    expect(runtimeResources[0]).toMatchInlineSnapshot(`
      RuntimeResource {
        "apiKey": null,
        "auth": "basic",
        "friendlyName": "vm1",
        "hostname": "vm1.domain.com",
        "https": true,
        "id": 1,
        "password": null,
        "port": 3000,
        "username": null,
      }
    `);
  });
});

describe("Schedule", () => {
  test("has expected properties", async () => {
    schedule = Schedule.create({
      name: "Test schedule",
      rule: "* * * * *",
      runtimeResource,
      validFrom: new Date("2020-12-31T20:00:00Z"),
    });
    await schedule.save();
    const schedules = await Schedule.find();
    expect(schedules[0]).toMatchInlineSnapshot(`
      Schedule {
        "force": false,
        "hardForceTime": 1800000,
        "hardTimeout": 86400000,
        "id": 1,
        "name": "Test schedule",
        "onError": null,
        "priority": 50,
        "rule": "* * * * *",
        "runtimeResource": RuntimeResource {
          "apiKey": null,
          "auth": "basic",
          "friendlyName": "vm1",
          "hostname": "vm1.domain.com",
          "https": true,
          "id": 1,
          "password": null,
          "port": 3000,
          "username": null,
        },
        "scheduleTask": Array [],
        "softForceTime": 900000,
        "softTimeout": 86400000,
        "validFrom": 2020-12-31T20:00:00.000Z,
        "validUntil": 9999-12-31T00:00:00.000Z,
        "waitTime": 86400000,
      }
    `);
  });
});

describe("Task", () => {
  test("has expected properties", async () => {
    task = Task.create({ name: "Test task", process: "Test process" });
    await task.save();
    const tasks = await Task.find();
    expect(tasks[0]).toMatchInlineSnapshot(`
      Task {
        "hardTimeout": 86400000,
        "id": 1,
        "inputs": null,
        "name": "Test task",
        "process": "Test process",
        "softTimeout": 86400000,
      }
    `);
  });
});

describe("ScheduleTask", () => {
  test("has expected properties", async () => {
    const scheduleTask = ScheduleTask.create({ schedule, step: 1, task });
    await scheduleTask.save();
    const scheduleTasks = await ScheduleTask.find();
    expect(scheduleTasks[0]).toMatchInlineSnapshot(`
      ScheduleTask {
        "abortEarly": true,
        "delayAfter": 0,
        "id": 1,
        "onError": null,
        "step": 1,
        "task": Task {
          "hardTimeout": 86400000,
          "id": 1,
          "inputs": null,
          "name": "Test task",
          "process": "Test process",
          "softTimeout": 86400000,
        },
      }
    `);
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
    expect(jobs[0]).toMatchInlineSnapshot(`
      Job {
        "addTime": 2020-12-31T20:00:00.000Z,
        "endTime": null,
        "id": 1,
        "message": null,
        "priority": 50,
        "runtimeResource": RuntimeResource {
          "apiKey": null,
          "auth": "basic",
          "friendlyName": "vm1",
          "hostname": "vm1.domain.com",
          "https": true,
          "id": 1,
          "password": null,
          "port": 3000,
          "username": null,
        },
        "schedule": Schedule {
          "force": false,
          "hardForceTime": 1800000,
          "hardTimeout": 86400000,
          "id": 1,
          "name": "Test schedule",
          "onError": null,
          "priority": 50,
          "rule": "* * * * *",
          "runtimeResource": RuntimeResource {
            "apiKey": null,
            "auth": "basic",
            "friendlyName": "vm1",
            "hostname": "vm1.domain.com",
            "https": true,
            "id": 1,
            "password": null,
            "port": 3000,
            "username": null,
          },
          "scheduleTask": Array [
            ScheduleTask {
              "abortEarly": true,
              "delayAfter": 0,
              "id": 1,
              "onError": null,
              "step": 1,
              "task": Task {
                "hardTimeout": 86400000,
                "id": 1,
                "inputs": null,
                "name": "Test task",
                "process": "Test process",
                "softTimeout": 86400000,
              },
            },
          ],
          "softForceTime": 900000,
          "softTimeout": 86400000,
          "validFrom": 2020-12-31T20:00:00.000Z,
          "validUntil": 9999-12-31T00:00:00.000Z,
          "waitTime": 86400000,
        },
        "sessionId": null,
        "startReason": "test",
        "startTime": null,
        "status": "waiting",
        "step": 1,
        "steps": null,
        "stopReason": null,
        "subStep": 1,
        "updateTime": 2020-12-31T20:00:00.000Z,
      }
    `);
  });
});
