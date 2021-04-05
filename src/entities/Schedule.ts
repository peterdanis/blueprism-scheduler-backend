import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";
import Job from "./Job";
import RuntimeResource from "./RuntimeResource";
import ScheduleTask from "./ScheduleTask";

interface OnError {
  action: "email";
  emailTo?: string;
  emailCc?: string;
}

@Entity()
export default class Schedule extends Base {
  @Column({ default: false })
  force!: boolean;

  @Column({ unique: true })
  name!: string;

  @Column({ default: 1800000 }) // The default 1800000ms equals to 30min
  hardForceTime!: number;

  @Column({ default: 86400000 }) // The default 86400000ms equals to 1d
  hardTimeout!: number;

  @Column({ nullable: true, type: "simple-json" })
  onError?: OnError;

  @Column({ default: defaultPriority })
  priority!: number;

  @Column()
  rule!: string;

  @Column({ default: 900000 }) // The default 900000ms equals to 15min
  softForceTime!: number;

  @Column({ default: 86400000 }) // The default 86400000ms equals to 1d
  softTimeout!: number;

  @Column()
  validFrom!: Date;

  @Column({ default: new Date(253402214400000).toISOString() }) // Equals to 31st of December 9999
  validUntil!: Date;

  @Column({ default: 86400000 }) // The default 86400000ms equals to 1d
  waitTime!: number;

  @OneToMany(() => ScheduleTask, (scheduleTask) => scheduleTask.schedule, {
    cascade: true,
    eager: true,
  })
  scheduleTask!: ScheduleTask[];

  @OneToMany(() => Job, (job) => job.schedule)
  job!: Job[];

  @ManyToOne(
    () => RuntimeResource,
    (runtimeResource) => runtimeResource.schedule,
    {
      eager: true,
      nullable: false,
    },
  )
  runtimeResource!: RuntimeResource;
}
