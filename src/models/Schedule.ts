import { DataTypes, ModelDefined, Optional, Sequelize } from "sequelize";

export interface ScheduleAttributes {
  id: number;
  name: string;
  schedule: string;
  validFrom: Date;
  validUntil: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
interface ScheduleCreationAttributes
  extends Optional<ScheduleAttributes, "id"> {}

const ScheduleFactory = (
  db: Sequelize,
): ModelDefined<ScheduleAttributes, ScheduleCreationAttributes> => {
  return db.define("Schedule", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    schedule: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    validFrom: {
      allowNull: false,
      defaultValue: DataTypes.NOW,
      type: DataTypes.DATE,
    },
    validUntil: {
      allowNull: false,
      defaultValue: DataTypes.NOW,
      type: DataTypes.DATE,
    },
  });
};

export default ScheduleFactory;

// `./src/models/user-model.ts`;

// import { BuildOptions, DataTypes, Model, Sequelize } from "sequelize";

// export interface UserAttributes {
//   id: number;
//   name: string;
//   email: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
// export interface UserModel extends Model<UserAttributes>, UserAttributes {}
// export class User extends Model<UserModel, UserAttributes> {}

// export type UserStatic = typeof Model & {
//   new (values?: object, options?: BuildOptions): UserModel;
// };

// export function UserFactory(sequelize: Sequelize): UserStatic {
//   return <UserStatic>sequelize.define("users", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//   });
// }
