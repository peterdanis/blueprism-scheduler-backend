import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";
import Job from "./Job";
import RuntimeResource from "./RuntimeResource";
import ScheduleTask from "./ScheduleTask";

@Entity()
export default class Schedule extends Base {
  @Column({ unique: true })
  name!: string;

  @Column({ default: defaultPriority })
  priority!: number;

  @Column()
  rule!: string;

  @Column()
  validFrom!: Date;

  @Column({ default: new Date(253402214400000).toISOString() }) // Equals to 31st of December 9999
  validUntil!: Date;

  @OneToMany(() => ScheduleTask, (scheduleTask) => scheduleTask.schedule)
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
