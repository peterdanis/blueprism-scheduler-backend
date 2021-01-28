import { Connection, createConnection } from "typeorm";
import {
  getScheduleRef,
  registerExistingSchedules,
} from "../../src/controller/schedule";
import config from "../testUtils/connectionHelper";
import loadDummies from "../testUtils/loadDummies";

let connection: Connection;

beforeAll(async () => {
  connection = await createConnection(config);
  await loadDummies();
});

afterAll(async () => {
  await connection.close();
});

describe("Init", () => {
  test("Description", async () => {
    await registerExistingSchedules();
    const schedule = getScheduleRef(1);
    expect(schedule?.name).toBeDefined();
  });
});
