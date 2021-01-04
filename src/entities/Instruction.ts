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
  @Column("simple-json")
  inputs!: Input[];

  @Column({ unique: true })
  name!: string;

  @Column()
  process!: string;

  @Column({ default: 86400000 })
  softTimeout!: number;

  @Column({ default: 86400000 })
  hardTimeout!: number;

  @OneToMany(
    () => ScheduleInstruction,
    (scheduleInstruction) => scheduleInstruction.instruction,
  )
  scheduleInstruction!: ScheduleInstruction[];
}
