import clearDatabase from "./clearDatabase";
import { createSchedulerDBConnection } from "../src/utils/connection";
import log from "../src/utils/logger";
import RuntimeResource from "../src/entity/RuntimeResource";
import Schedule from "../src/entity/Schedule";
import ScheduleTask from "../src/entity/ScheduleTask";
import Task from "../src/entity/Task";
import User from "../src/entity/User";

export default (async () => {
  const connection = await createSchedulerDBConnection();
  await clearDatabase(connection);
  try {
    await connection.synchronize();

    const user1 = User.create({
      name: `Dummy${new Date().getTime()}`,
    });
    await user1.save();

    const vm1 = RuntimeResource.create({
      auth: "basic",
      friendlyName: "vm1",
      hostname: "vm1.something.com",
      port: 3000,
    });
    await vm1.save();

    const vm2 = RuntimeResource.create({
      auth: "basic",
      friendlyName: "vm2",
      hostname: "vm2.something.com",
      port: 3000,
    });
    await vm2.save();

    const task1 = Task.create({
      hardTimeout: 100000,
      name: "Login",
      process: "Login",
      softTimeout: 100000,
    });
    await task1.save();

    const task2 = Task.create({
      hardTimeout: 100000,
      inputs: [
        {
          "@name": "Time to run",
          "@type": "text",
          "@value": "120",
        },
      ],
      name: "Test process 2mins",
      process: "Test process",
      softTimeout: 100000,
    });
    await task2.save();

    const task3 = Task.create({
      hardTimeout: 100000,
      inputs: [
        {
          "@name": "Time to run",
          "@type": "text",
          "@value": "300",
        },
      ],
      name: "Test process 5mins",
      process: "Test process",
      softTimeout: 100000,
    });
    await task3.save();

    const schedule1 = Schedule.create({
      name: "Test schedule 1",
      rule: "* * * * *",
      runtimeResource: vm1,
      validFrom: new Date(),
    });
    await schedule1.save();

    const schedule2 = Schedule.create({
      name: "Test schedule 2",
      rule: "*/2 * * * *",
      runtimeResource: vm2,
      validFrom: new Date(),
    });
    await schedule2.save();

    const schedule3 = Schedule.create({
      name: "Test schedule 3",
      priority: 40,
      rule: "*/2 * * * *",
      runtimeResource: vm2,
      validFrom: new Date(),
    });
    await schedule3.save();

    const scheduleTask1 = ScheduleTask.create({
      delayAfter: 30000,
      schedule: schedule1,
      step: 1,
      task: task1,
    });
    await scheduleTask1.save();

    const scheduleTask2 = ScheduleTask.create({
      delayAfter: 0,
      schedule: schedule1,
      step: 2,
      task: task2,
    });
    await scheduleTask2.save();

    const scheduleTask3 = ScheduleTask.create({
      delayAfter: 1000,
      schedule: schedule1,
      step: 3,
      task: task3,
    });
    await scheduleTask3.save();

    const scheduleTask4 = ScheduleTask.create({
      delayAfter: 30000,
      schedule: schedule2,
      step: 1,
      task: task1,
    });
    await scheduleTask4.save();

    const scheduleTask5 = ScheduleTask.create({
      delayAfter: 0,
      schedule: schedule2,
      step: 2,
      task: task2,
    });
    await scheduleTask5.save();

    const scheduleTask6 = ScheduleTask.create({
      delayAfter: 0,
      schedule: schedule3,
      step: 2,
      task: task2,
    });
    await scheduleTask6.save();

    log.info("Dummies executed");
  } catch (error) {
    log.error(error);
  } finally {
    await connection?.close();
  }
})();
