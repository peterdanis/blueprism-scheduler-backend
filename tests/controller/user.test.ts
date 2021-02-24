import { Connection, createConnection } from "typeorm";
import { addUser } from "../../src/controller/user";
import config from "../testUtils/testConnectionConfig";
import User from "../../src/entity/User";

let connection: Connection;
const testPassword = "password#123";

beforeAll(async () => {
  connection = await createConnection(config);
});

afterAll(async () => {
  await connection.close();
});

describe("User", () => {
  test("add new user", async () => {
    await addUser("testUser", testPassword);
    const users = await User.find();
    expect(users).toMatchSnapshot();
  });
});
