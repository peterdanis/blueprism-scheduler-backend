import { Connection, createConnection } from "typeorm";
import config from "./connectionHelper";
import RuntimeResource from "../src/entity/RuntimeResource";
import Schedule from "../src/entity/Schedule";
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

describe("Runtime resource", () => {
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
