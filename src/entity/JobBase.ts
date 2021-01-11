import { Column, UpdateDateColumn } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";

type Status =
  | "canceled"
  | "checking"
  | "failed"
  | "finished"
  | "running"
  | "skipped"
  | "stopped"
  | "waiting";

export default class JobBase extends Base {
  @Column()
  addTime!: Date;

  @Column({ nullable: true })
  endTime!: Date;

  @Column({ nullable: true })
  message!: string;

  @Column({ default: defaultPriority })
  priority!: number; // De-normalized priority field - to by able to get the queued schedule higher or lower priority

  @Column({ nullable: true })
  sessionId!: string;

  @Column({ nullable: true })
  startTime!: Date;

  @Column()
  status!: Status;

  @Column({ default: 1 })
  step!: number;

  @Column({ default: 1 })
  subStep!: number;

  @UpdateDateColumn()
  updateTime!: Date;
}
