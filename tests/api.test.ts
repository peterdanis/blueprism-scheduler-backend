import app from "../src/api";
import request from "supertest";
import User from "../src/entities/User";

// User.find = jest.fn();

const dummyUser: Partial<User> = {
  id: 1,
  name: "test",
};

const mockUser = jest.spyOn(User, "find");

mockUser.mockImplementation(
  async (): Promise<User[]> => {
    return [dummyUser as User];
  },
);

const get = (route: string): request.Test => request(app).get(route); // .auth(username, pw);

jest.mock("../src/entities/User.ts");

// const post = (route, input) => request(app).post(route).send(input); // .auth(username, pw);

describe("Description", () => {
  test("Description", async () => {
    const result = await get("/api/users");
    expect(result.status).toBe(200);
    expect(result.body).toEqual([dummyUser]);
  });
});
