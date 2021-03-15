import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Setting extends Base {
  @Column()
  key!: string;

  @Column()
  value!: string;
}
