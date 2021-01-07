import { Column, Entity, OneToMany } from "typeorm";
import Base from "./Base";
import Schedule from "./Schedule";

@Entity()
export default class RuntimeResource extends Base {
  @Column()
  hostname!: string;

  @Column()
  friendlyName!: string;

  @OneToMany(() => Schedule, (schedule) => schedule.runtimeResource)
  schedule!: Schedule[];
}
