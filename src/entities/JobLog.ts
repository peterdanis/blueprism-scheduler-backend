import { Column, Entity } from "typeorm";
import JobBase from "./JobBase";

@Entity()
export default class JobLog extends JobBase {
  @Column()
  jobId!: number;

  @Column()
  scheduleId!: number;

  @Column()
  runtimeResourceId!: number;
}
