import schedule from "./controllers/schedule";
import { Sequelize } from "sequelize";

export default async (
  dbname: string,
  username: string,
  password: string,
  host: string,
  port: number,
): Promise<void> => {
  const schedulerDB = new Sequelize(dbname, username, password, {
    dialect: "mssql",
    host,
    port,
  });

  schedule.init();

  await schedulerDB.sync();
};
