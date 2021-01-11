import { Column, Entity, ManyToOne, Unique } from "typeorm";
import Base from "./Base";
import Schedule from "./Schedule";
import Task from "./Task";

@Entity()
@Unique("step_scheduleId", ["step", "schedule"])
export default class ScheduleTask extends Base {
  @Column({ default: 0 })
  delayAfter!: number;

  @Column()
  step!: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.scheduleTask, {
    nullable: false,
  })
  schedule!: Schedule;

  @ManyToOne(() => Task, (task) => task.scheduleTask, {
    eager: true,
    nullable: false,
  })
  task!: Task;
}
