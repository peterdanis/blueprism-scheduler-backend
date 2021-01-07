import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "../src/utils/getEnvVariables";
import { createConnection } from "typeorm";
import Instruction from "../src/entities/Instruction";
import Job from "../src/entities/Job";
import log from "../src/utils/logger";
import RuntimeResource from "../src/entities/RuntimeResource";
import Schedule from "../src/entities/Schedule";
import ScheduleInstruction from "../src/entities/ScheduleInstruction";
import User from "../src/entities/User";

export default (async () => {
  let connection;
  try {
    connection = await createConnection({
      database: dbName,
      entities: [
        User,
        RuntimeResource,
        Instruction,
        Job,
        Schedule,
        ScheduleInstruction,
      ],
      host: dbHost,
      logging: ["error", "warn"],
      password: dbPassword,
      port: dbPort,
      synchronize: true,
      type: "mssql",
      username: dbUsername,
    });
    log(`Connected to: ${dbHost}, database: ${dbName}`);

    const user1 = User.create({ admin: true, name: "Dummy1" });
    await user1.save();
    const user2 = User.create({
      name: `Dummy${Math.floor(Math.random() * 1000000)}`,
    });
    await user2.save();
    const users1 = await User.find();
    log(users1);
    const deletedUser = await User.findOne({ where: { name: "Dummy1" } });
    deletedUser?.remove();
    const users2 = await User.find();
    log(users2);

    const vm1 = RuntimeResource.create({
      friendlyName: "vm1",
      hostname: "vm1.something.com",
    });
    await vm1.save();

    const vm2 = RuntimeResource.create({
      friendlyName: "vm2",
      hostname: "vm2.something.com",
    });
    await vm2.save();

    const instruction1 = Instruction.create({
      hardTimeout: 100000,
      name: "Login 2",
      process: "Login",
      softTimeout: 100000,
    });
    await instruction1.save();

    const instruction2 = Instruction.create({
      hardTimeout: 100000,
      inputs: [
        {
          "@name": "input name",
          "@type": "text",
          "@value": "my input",
        },
      ],
      name: "Some process",
      process: "Some process",
      softTimeout: 100000,
    });
    await instruction2.save();

    const schedule1 = Schedule.create({
      name: "Test schedule 1",
      runtimeResource: vm1,
      schedule: "10 * * * *",
      validFrom: new Date().toISOString(),
    });
    await schedule1.save();

    const schedule2 = Schedule.create({
      name: "Test schedule 2",
      runtimeResource: vm2,
      schedule: "10 * * * *",
      validFrom: new Date().toISOString(),
    });
    await schedule2.save();

    log("Dummies executed");
  } catch (error) {
    log(error);
  } finally {
    connection?.close();
  }
})();
