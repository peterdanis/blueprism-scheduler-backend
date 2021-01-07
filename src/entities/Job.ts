import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Job extends Base {
  @Column()
  priority!: number; // De-normalized priority field - to by able to get the queued schedule higher or lower priority

  @Column()
  startTime!: Date;

  @Column()
  status!: number;

  @Column({ default: 0 })
  step!: number;

  @Column({ default: 0 })
  subStep!: number;
}
