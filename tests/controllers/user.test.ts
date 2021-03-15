import {
  addUser,
  changePassword,
  generateApiKey,
  getUser,
  verifyApiKey,
  verifyPassword,
} from "../../src/controllers/user";
import { Connection, createConnection } from "typeorm";
import config from "../testUtils/testConnectionConfig";
import User from "../../src/entities/User";

let connection: Connection;
const testPassword = "password#123";
const testUserName = "testUser";
const testUserName2 = "testUser2";

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

test("User can be created without password", async () => {
  const user = await addUser(testUserName2);
  expect(user).toBeInstanceOf(User);
});

test("User without password can not be authenticated", async () => {
  const [, user] = await User.find();
  const passwordMatch = await verifyPassword(user!.name, testPassword);
  expect(passwordMatch).toBeUndefined();
});

test("Regenerating API key returns new and correct API key", async () => {
  const [user] = await User.find();
  const oldApiKey = await generateApiKey(user!.id);
  const newApiKey = await generateApiKey(user!.id);
  const oldKeyMatch = await verifyApiKey(oldApiKey);
  const newKeyMatch = await verifyApiKey(newApiKey);
  expect(oldKeyMatch).toBeUndefined();
  expect(newKeyMatch).toBeInstanceOf(User);
});

test("Password can be changed", async () => {
  const [user] = await User.find();
  const newPassword = "newPassword";
  await changePassword(user!.name, newPassword);
  const oldPasswordMatch = await verifyPassword(user!.name, testPassword);
  const newPasswordMatch = await verifyPassword(user!.name, newPassword);
  expect(oldPasswordMatch).toBeUndefined();
  expect(newPasswordMatch).toBeInstanceOf(User);
});

test("User can by found by id or name", async () => {
  const userByName = await getUser(testUserName);
  const userById = await getUser(1);
  expect(userByName).toBe(userById);
});

test("Username must be unique", async () => {
  const testFn = async (): Promise<void> => {
    await addUser(testUserName, testPassword);
  };
  return expect(testFn).rejects.toThrow(
    "SQLITE_CONSTRAINT: UNIQUE constraint failed: user.name",
  );
});
