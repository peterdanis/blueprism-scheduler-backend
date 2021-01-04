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
import User from "./entities/User";

export const init = async (): Promise<void> => {
  try {
    const connection = await createConnection({
      database: dbName,
      entities: [User, RuntimeResource, Instruction, Job, Schedule],
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

    // const tables: string[] = [
    //   "user",
    //   "instruction",
    //   "runtime_resource",
    //   "schedule",
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
      // await user.save();
      // const vm = RuntimeResource.create({
      //   friendlyName: "vm",
      //   hostname: "vm.something.com",
      // });
      // await vm.save();
      //   const instruction = Instruction.create({
      //     inputs: [
      //       {
      //         "@name": "input name",
      //         "@type": "text",
      //         "@value": "my input",
      //       },
      //     ],
      //     name: "Login",
      //     process: "Some process",
      //     timeout: 100000,
      //   });
      //   await instruction.save();
      //   const schedule = Schedule.create({
      //     name: "Test schedule 2",
      //     schedule: "10 * * * *",
      //     validFrom: new Date().toISOString(),
      //   });
      //   await schedule.save();
      log("Dummies executed");
    } catch (error) {
      //
    }
  } catch (error) {
    log(error);
  }
};

export const dummy = "dummy";
