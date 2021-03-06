import { Column, Entity, ManyToOne, Unique } from "typeorm";
import Base from "./Base";
import Schedule from "./Schedule";
import Task from "./Task";

interface OnError {
  action: "email";
  emailTo?: string;
  emailCc?: string;
}

@Entity()
@Unique("step_scheduleId", ["step", "schedule"])
export default class ScheduleTask extends Base {
  @Column({ default: true })
  abortEarly!: boolean;

  @Column({ default: 0 })
  delayAfter!: number;

  @Column({ nullable: true, type: "simple-json" })
  onError?: OnError;

  @Column()
  step!: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.scheduleTask, {
    nullable: false,
    orphanedRowAction: "delete",
  })
  schedule!: Schedule;

  @ManyToOne(() => Task, (task) => task.scheduleTask, {
    eager: true,
    nullable: false,
  })
  task!: Task;
}
