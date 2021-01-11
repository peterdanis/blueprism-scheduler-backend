import { Entity, ManyToOne } from "typeorm";
import JobBase from "./JobBase";
import RuntimeResource from "./RuntimeResource";
import Schedule from "./Schedule";

@Entity()
export default class Job extends JobBase {
  @ManyToOne(() => RuntimeResource, (runtimeResource) => runtimeResource.job, {
    eager: true,
    nullable: false,
  })
  runtimeResource!: RuntimeResource;

  @ManyToOne(() => Schedule, (schedule) => schedule.job, {
    eager: true,
    nullable: false,
  })
  schedule!: Schedule;
}
