import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Schedule extends Base {
  @Column()
  name!: string;

  @Column()
  schedule!: string;
}
