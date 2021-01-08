import { Column, Entity, OneToMany } from "typeorm";
import Base from "./Base";
import Job from "./Job";
import Schedule from "./Schedule";

@Entity()
export default class RuntimeResource extends Base {
  @Column()
  hostname!: string;

  @Column()
  friendlyName!: string;

  @OneToMany(() => Job, (job) => job.schedule)
  job!: Job[];

  @OneToMany(() => Schedule, (schedule) => schedule.runtimeResource)
  schedule!: Schedule[];
}
