import { Column, Entity, ManyToOne, Unique } from "typeorm";
import Base from "./Base";
import Instruction from "./Instruction";
import Schedule from "./Schedule";

@Entity()
@Unique("step_scheduleId", ["step", "schedule"])
export default class ScheduleInstruction extends Base {
  @Column({ default: 0 })
  delayAfter!: number;

  @Column()
  step!: number;

  @ManyToOne(
    () => Schedule,
    (schedule: Schedule) => schedule.scheduleInstruction,
    {
      nullable: false,
    },
  )
  schedule!: Schedule;

  @ManyToOne(
    () => Instruction,
    (instruction: Instruction) => instruction.scheduleInstruction,
    {
      nullable: false,
    },
  )
  instruction!: Instruction;
}
