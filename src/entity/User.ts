import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class User extends Base {
  @Column({ nullable: true })
  apiKey!: string;

  @Column({ default: false })
  admin!: boolean;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  password!: string;
}
