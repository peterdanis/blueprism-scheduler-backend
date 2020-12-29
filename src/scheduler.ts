import { Sequelize } from "sequelize";

export default (
  dbname: string,
  username: string,
  password: string,
  host: string,
  port: number,
): void => {
  const schedulerDB = new Sequelize(dbname, username, password, {
    dialect: "mssql",
    host,
    port,
  });
};
