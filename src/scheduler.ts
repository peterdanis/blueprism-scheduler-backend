import "reflect-metadata";
import {
  dbHost,
  dbName,
  dbPassword,
  dbPort,
  dbUsername,
} from "./utils/getEnvVariables";
import { createConnection } from "typeorm";
import Instruction from "./entities/Instruction";
import Job from "./entities/Job";
import log from "./utils/logger";
import RuntimeResource from "./entities/RuntimeResource";
import Schedule from "./entities/Schedule";
import ScheduleInstruction from "./entities/ScheduleInstruction";
import User from "./entities/User";

export const init = async (): Promise<void> => {
  try {
    const connection = await createConnection({
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

    // load dummy data
    const queryRunner = connection.createQueryRunner();

    // await queryRunner.dropTable("schedule_instruction");
    // const tables: string[] = [
    //   "user",
    //   "instruction",
    //   "schedule",
    //   "runtime_resource",
    //   "job",
    // ];
    // for (const table of tables) {
    //   const t = await queryRunner.getTable(table);
    //   if (t) {
    //     await queryRunner.dropTable(table);
    //   }
    // }

    try {
      // const user = User.create({
      //   name: "Dummy",
      // });
      //
      // await user.save();
      // const vm1 = RuntimeResource.create({
      //   friendlyName: "vm1",
      //   hostname: "vm1.something.com",
      // });
      // await vm1.save();
      //
      // const vm2 = RuntimeResource.create({
      //   friendlyName: "vm2",
      //   hostname: "vm2.something.com",
      // });
      // await vm2.save();
      //
      // const instruction1 = Instruction.create({
      //   hardTimeout: 100000,
      //   // inputs: [
      //   //   {
      //   //     "@name": "input name",
      //   //     "@type": "text",
      //   //     "@value": "my input",
      //   //   },
      //   // ],
      //   name: "Login 2",
      //   process: "Login",
      //   softTimeout: 100000,
      // });
      // await instruction1.save();
      //
      // const instruction2 = Instruction.create({
      //   hardTimeout: 100000,
      //   inputs: [
      //     {
      //       "@name": "input name",
      //       "@type": "text",
      //       "@value": "my input",
      //     },
      //   ],
      //   name: "Some process",
      //   process: "Some process",
      //   softTimeout: 100000,
      // });
      // await instruction2.save();
      //
      // const schedule1 = Schedule.create({
      //   name: "Test schedule 1",
      //   runtimeResource: vm1,
      //   schedule: "10 * * * *",
      //   validFrom: new Date().toISOString(),
      // });
      // await schedule1.save();
      //
      // const schedule2 = Schedule.create({
      //   name: "Test schedule 2",
      //   runtimeResource: vm2,
      //   schedule: "10 * * * *",
      //   validFrom: new Date().toISOString(),
      // });
      // await schedule2.save();

      //
      log("Dummies executed");
    } catch (error) {
      //
    }
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
