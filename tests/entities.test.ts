import { Connection, createConnection } from "typeorm";
import config from "./connectionHelper";
import User from "../src/entity/User";

let connection: Connection;

beforeAll(async () => {
  connection = await createConnection(config);
});

afterAll(async () => {
  await connection.close();
});

describe("User", () => {
  test("has name", async () => {
    const name = "Test";
    const user = User.create({ name });
    await user.save();
    expect(user.name).toBe(name);
  });
});
