import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";
import Job from "./Job";
import RuntimeResource from "./RuntimeResource";
import ScheduleInstruction from "./ScheduleInstruction";

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

  @OneToMany(
    () => ScheduleInstruction,
    (scheduleInstruction) => scheduleInstruction.schedule,
  )
  scheduleInstruction!: ScheduleInstruction[];

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
