import app from "../src/api";
import request from "supertest";
import Schedule from "../src/entities/Schedule";
import User from "../src/entities/User";

const dummyUser: Partial<User> = {
  id: 1,
  name: "TestUser",
};

const dummySchedule: Partial<Schedule> = {
  id: 1,
  name: "TestSchedule",
};

const mockUser = jest.spyOn(User, "find");
jest.mock("../src/utils/logger");

mockUser.mockImplementation(
  async (): Promise<User[]> => {
    return [dummyUser as User];
  },
);

const mockSchedule = jest.spyOn(Schedule, "find");
jest.mock("../src/utils/logger");

mockSchedule.mockImplementation(
  async (): Promise<Schedule[]> => {
    return [dummySchedule as Schedule];
  },
);

const get = (route: string): request.Test => request(app).get(route); // .auth(username, pw);

jest.mock("../src/entities/User.ts");

// const post = (route, input) => request(app).post(route).send(input); // .auth(username, pw);

describe("Users route", () => {
  test("can get all users", async () => {
    const result = await get("/api/users");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummyUser]);
  });
});

describe("Schedules route", () => {
  test("can get all schedules", async () => {
    const result = await get("/api/schedules");
    expect(result.status).toBe(200);
  });
});
