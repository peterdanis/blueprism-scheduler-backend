import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class User extends Base {
  @Column()
  name!: string;

  @Column()
  readonly!: boolean;
}
