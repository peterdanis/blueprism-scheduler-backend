import app from "../src/api";
import { dummyUser } from "./mocks/mockUser";
import request from "supertest";
import Schedule from "../src/entities/Schedule";

jest.mock("../src/utils/logger");
jest.mock("../src/entities/User.ts");

const dummySchedule: Partial<Schedule> = {
  id: 1,
  name: "TestSchedule",
};

const mockSchedule = jest.spyOn(Schedule, "find");

mockSchedule.mockImplementation(
  async (): Promise<Schedule[]> => {
    return [dummySchedule as Schedule];
  },
);

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
