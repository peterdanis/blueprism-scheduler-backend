import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class User extends Base {
  @Column({ unique: true })
  name!: string;

  @Column({ default: true })
  readonly!: boolean;
}
