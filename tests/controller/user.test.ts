import { addUser, generateApiKey, verify } from "../../src/controller/user";
import { Connection, createConnection } from "typeorm";
import config from "../testUtils/testConnectionConfig";
import User from "../../src/entity/User";

let connection: Connection;
const testPassword = "password#123";
const testUserName = "testUser";

beforeAll(async () => {
  connection = await createConnection(config);
});

afterAll(async () => {
  await connection.close();
});

test("Adding new user creates and returns new user", async () => {
  const user = await addUser(testUserName, testPassword);
  expect(user).toBeInstanceOf(User);
});

test("Regenerating API key returns new and correct API key", async () => {
  const [user] = await User.find();
  const oldApiKey = await generateApiKey(user!.name);
  const newApiKey = await generateApiKey(user!.name);
  const oldKeyMatch = await verify(oldApiKey, testUserName, "apiKey");
  const newKeyMatch = await verify(newApiKey, testUserName, "apiKey");
  expect(oldKeyMatch).toBeFalsy();
  expect(newKeyMatch).toBeTruthy();
});

test("Username must be unique", async () => {
  const testFn = async (): Promise<void> => {
    await addUser(testUserName, testPassword);
  };
  return expect(testFn).rejects.toThrow(
    "SQLITE_CONSTRAINT: UNIQUE constraint failed: user.name",
  );
});
