import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "../src/utils/getEnvVariable";
import clearDatabase from "./clearDatabase";
import { createConnection } from "typeorm";
import Job from "../src/entity/Job";
import JobLog from "../src/entity/JobLog";
import log from "../src/utils/logger";
import RuntimeResource from "../src/entity/RuntimeResource";
import Schedule from "../src/entity/Schedule";
import ScheduleTask from "../src/entity/ScheduleTask";
import Task from "../src/entity/Task";
import User from "../src/entity/User";

export default (async () => {
  await clearDatabase();
  let connection;
  try {
    connection = await createConnection({
      database: dbName,
      entities: [
        Job,
        JobLog,
        RuntimeResource,
        Schedule,
        ScheduleTask,
        Task,
        User,
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

    const task1 = Task.create({
      hardTimeout: 100000,
      name: "Login 2",
      process: "Login",
      softTimeout: 100000,
    });
    await task1.save();

    const task2 = Task.create({
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
    await task2.save();

    const schedule1 = Schedule.create({
      name: "Test schedule 1",
      rule: "* * * * *",
      runtimeResource: vm1,
      validFrom: new Date().toISOString(),
    });
    await schedule1.save();

    const schedule2 = Schedule.create({
      name: "Test schedule 2",
      rule: "*/5 * * * *",
      runtimeResource: vm2,
      validFrom: new Date().toISOString(),
    });
    await schedule2.save();

    const scheduleTask1 = ScheduleTask.create({
      delayAfter: 1000,
      schedule: schedule1,
      step: 1,
      task: task1,
    });
    await scheduleTask1.save();

    const scheduleTask2 = ScheduleTask.create({
      delayAfter: 1000,
      schedule: schedule1,
      step: 2,
      task: task2,
    });
    await scheduleTask2.save();

    const scheduleTask3 = ScheduleTask.create({
      delayAfter: 1000,
      schedule: schedule2,
      step: 1,
      task: task1,
    });
    await scheduleTask3.save();

    log("Dummies executed");
  } catch (error) {
    log(error);
  } finally {
    await connection?.close();
  }
})();
