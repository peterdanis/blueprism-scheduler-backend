import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import Base from "./Base";
import RuntimeResource from "./RuntimeResource";
import ScheduleInstruction from "./ScheduleInstruction";

@Entity()
export default class Schedule extends Base {
  @Column({ unique: true })
  name!: string;

  @Column()
  schedule!: string;

  @Column()
  validFrom!: Date;

  @Column({ default: new Date(253402214400000).toISOString() })
  validUntil!: Date;

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
}
