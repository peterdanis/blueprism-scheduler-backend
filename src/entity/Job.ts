import { Column, Entity, ManyToOne } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";
import RuntimeResource from "./RuntimeResource";
import Schedule from "./Schedule";

type Status = "waiting" | "running" | "finished" | "failed";

@Entity()
export default class Job extends Base {
  @Column({ default: defaultPriority })
  priority!: number; // De-normalized priority field - to by able to get the queued schedule higher or lower priority

  @Column({ nullable: true })
  sessionId!: string;

  @Column()
  startTime!: Date;

  @Column()
  status!: Status;

  @Column({ default: 0 })
  step!: number;

  @Column({ default: 0 })
  subStep!: number;

  @ManyToOne(() => RuntimeResource, (runtimeResource) => runtimeResource.job, {
    nullable: false,
  })
  runtimeResource!: RuntimeResource;

  @ManyToOne(() => Schedule, (schedule) => schedule.job, {
    nullable: false,
  })
  schedule!: Schedule;
}
