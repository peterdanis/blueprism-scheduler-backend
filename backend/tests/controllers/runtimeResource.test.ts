import { Connection, createConnection } from "typeorm";
import { addRuntimeResource } from "../../src/controllers/runtimeResource";
import config from "../testUtils/testConnectionConfig";

jest.mock("../../src/utils/logger");

let connection: Connection;

beforeAll(async () => {
  connection = await createConnection(config);
  // await loadDummies();
});

afterAll(async () => {
  await connection.close();
});

test("Description", async () => {
  const testFn = async (): Promise<void> => {
    await addRuntimeResource({});
  };
  await expect(testFn).rejects.toThrow();
});
