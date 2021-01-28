import clearDatabase from "./clearDatabase";
import { createConnection } from "typeorm";
import loadDummies from "./loadDummies";
import log from "../../src/utils/logger";
import schedDbConfig from "../../src/utils/connectionConfig";

export default (async () => {
  const connection = await createConnection(schedDbConfig);
  try {
    await clearDatabase(connection);
    await connection.synchronize();

    await loadDummies();

    log.info("Dummies executed");
  } catch (error) {
    log.error(error);
  } finally {
    await connection?.close();
  }
})();
