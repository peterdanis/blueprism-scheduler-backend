import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";
import RuntimeResource from "./RuntimeResource";
import ScheduleInstruction from "./ScheduleInstruction";

@Entity()
export default class Schedule extends Base {
  @Column({ unique: true })
  name!: string;

  @Column()
  schedule!: string;

  @Column({ default: defaultPriority })
  priority!: number;

  @OneToMany(
    () => ScheduleInstruction,
    (scheduleInstruction) => scheduleInstruction.schedule,
  )
  scheduleInstruction!: ScheduleInstruction[];

  @ManyToOne(
    () => RuntimeResource,
    (runtimeResource) => runtimeResource.schedule,
    {
      nullable: false,
    },
  )
  runtimeResource!: RuntimeResource;

  @Column()
  validFrom!: Date;

  @Column({ default: new Date(253402214400000).toISOString() }) // Equals to 31st of December 9999
  validUntil!: Date;
}
