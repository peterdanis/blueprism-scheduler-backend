import { Connection, createConnection } from "typeorm";
import {
  getScheduleRef,
  registerExistingSchedules,
} from "../../src/controller/schedule";
import config from "../testUtils/testConnectionConfig";
import { install } from "@sinonjs/fake-timers";
import loadDummies from "../testUtils/loadDummies";
import { scheduledJobs } from "node-schedule";

let connection: Connection;

beforeAll(async () => {
  connection = await createConnection(config);
  await loadDummies();
});

afterAll(async () => {
  await connection.close();
  Object.values(scheduledJobs).forEach((job) => job.cancel());
});

describe("Scheduler", () => {
  test("will register valid schedule", async () => {
    const clock = install({
      now: new Date("2021-01-20T02:00:00Z"),
    });

    await registerExistingSchedules();
    const schedule = getScheduleRef(1);
    // @ts-ignore
    clock.tick("05:00");
    expect(schedule?.name).toMatch("1");
  });
});
