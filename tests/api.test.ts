import app from "../src/api";
import { dummyJob } from "./mocks/mockJob";
import { dummyJobLog } from "./mocks/mockJobLog";
import { dummySchedule } from "./mocks/mockSchedule";
import { dummyUser } from "./mocks/mockUser";
import request from "supertest";
import { dummyMachine } from "./mocks/mockRuntimeResource";

jest.mock("../src/utils/logger");
jest.mock("../src/entities/User.ts");
jest.mock("../src/entities/Schedule.ts");
jest.mock("../src/entities/Job.ts");
jest.mock("../src/entities/JobLog.ts");
jest.mock("../src/entities/RuntimeResource.ts");

const get = (route: string): request.Test => request(app).get(route); // .auth(username, pw);

const post = (route: string, input: Record<string, unknown>): request.Test =>
  request(app).post(route).send(input); // .auth(username, pw);

describe("Users route", () => {
  test("can get all users", async () => {
    const result = await get("/api/users");
    expect(result.status).toBe(200);
    expect(result.body).toStrictEqual([dummyUser]);
  });
  test("can create new user with and without password", async () => {
    const result = await post("/api/users", { name: "NewUser" });
    const result2 = await post("/api/users", {
      name: "NewUser",
      password: "newpassword",
    });
    expect(result2.status).toBe(201);
    expect(result.status).toBe(201);
    expect(result.body).toStrictEqual(dummyUser);
  });
});

describe("Schedules route", () => {
  test("can get all schedules", async () => {
    const result = await get("/api/schedules");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummySchedule]);
  });
});

describe("Jobs route", () => {
  test("can get all jobs", async () => {
    const result = await get("/api/jobs");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummyJob]);
  });
});

describe("JobLogs route", () => {
  test("can get all jobs", async () => {
    const result = await get("/api/jobLogs");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummyJobLog]);
  });
});

describe("RuntimeResources route", () => {
  test("can get all runtime resources", async () => {
    const result = await get("/api/runtimeResources");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummyMachine]);
  });
});
