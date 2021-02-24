import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class User extends Base {
  @Column({ default: false })
  admin!: boolean;

  @Column({ unique: true })
  name!: string;

  @Column()
  password!: string;
}
