import { Column, Entity, OneToMany } from "typeorm";
import Base from "./Base";
import ScheduleInstruction from "./ScheduleInstruction";

interface Input {
  "@name": string;
  "@value": string;
  "@type": "text";
}

@Entity()
export default class Instruction extends Base {
  @Column({ nullable: true, type: "simple-json" })
  inputs!: Input[];

  @Column({ default: 86400000 }) // The default 86400000ms equals to 1d
  hardTimeout!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  process!: string;

  @OneToMany(
    () => ScheduleInstruction,
    (scheduleInstruction) => scheduleInstruction.instruction,
  )
  scheduleInstruction!: ScheduleInstruction[];

  @Column({ default: 86400000 }) // The default 86400000ms equals to 1d
  softTimeout!: number;
}
