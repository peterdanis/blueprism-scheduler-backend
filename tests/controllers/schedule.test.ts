import { Connection, createConnection } from "typeorm";
import {
  addSchedule,
  getScheduleRef,
  registerExistingSchedules,
} from "../../src/controllers/schedule";
import config from "../testUtils/testConnectionConfig";
import { install } from "@sinonjs/fake-timers";
import loadDummies from "../testUtils/loadDummies";
import { scheduledJobs } from "node-schedule";
import { getRuntimeResources } from "../../src/controllers/runtimeResource";

jest.mock("../../src/utils/logger");

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
  test("registers existing schedules", async () => {
    await registerExistingSchedules();
    const schedule = getScheduleRef(1);

    expect(schedule?.name).toMatch("1");
  });

  test("throws with wrong rule", async () => {
    const [runtimeResource] = await getRuntimeResources();
    const testFn = async (): Promise<void> => {
      await addSchedule({
        name: "Test 4",
        rule: "70 * * * *",
        runtimeResource,
        validFrom: new Date(),
      });
    };
    await expect(testFn).rejects.toThrow("Constraint error");
  });

  test("accepts and registers new schedule", async () => {
    const [runtimeResource] = await getRuntimeResources();
    const { id } = await addSchedule({
      name: "Test 4",
      rule: "* * * * *",
      runtimeResource,
      validFrom: new Date("9999-01-01"),
    });
    const schedule = getScheduleRef(id);

    // const clock = install({
    //   now: new Date("2021-01-20T02:00:00Z"),
    // });
    // @ts-ignore
    // clock.tick("05:00");

    expect(schedule?.name).toMatch(id.toString());
    expect(schedule?.nextInvocation().toISOString()).toBe(
      "9999-01-01T00:01:00.000Z",
    );
  });
});
