import { Column, Entity } from "typeorm";
import Base from "./Base";
import { RecurrenceRule } from "node-schedule";

@Entity()
export default class Schedule extends Base {
  @Column()
  name!: string;

  @Column()
  schedule!: RecurrenceRule;
}
