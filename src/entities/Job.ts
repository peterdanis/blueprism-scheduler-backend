import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Job extends Base {
  @Column()
  startTime!: Date;

  @Column({ default: 100 })
  priority!: number;

  @Column({ default: 0 })
  step!: number;

  @Column({ default: 0 })
  subStep!: number;
}
