import { Column, UpdateDateColumn } from "typeorm";
import Base from "./Base";
import { defaultPriority } from "../utils/getSetting";

type JobStatus =
  | "canceled" // if skipped or canceled from user side
  | "failed" // if step status on BP side is terminated and step is setup to abort early, or if any error occurs, or if stopped by hardTimeout
  | "finished" // if all steps finished successfully
  | "running" // if any step is still running
  | "stopped" // if stopped by softTimeout or by softStop request, either from scheduler side or user side
  | "waiting"; // if the job is waiting in queue

type StepStatus = "failed" | "finished" | "stopped";

interface Steps {
  [key: number]: StepStatus;
}

export default class JobBase extends Base {
  @Column()
  addTime!: Date;

  @Column({ nullable: true })
  endTime?: Date;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: defaultPriority })
  priority!: number; // De-normalized priority field - to by able to get the queued schedule higher or lower priority

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  startTime?: Date;

  @Column()
  startReason!: string;

  @Column()
  status!: JobStatus;

  @Column({ default: 1 })
  step!: number;

  @Column({ nullable: true, type: "simple-json" })
  steps?: Steps;

  @Column({ nullable: true })
  stopReason?: string;

  @Column({ default: 1 })
  subStep!: number;

  @UpdateDateColumn({ type: "datetime" })
  updateTime!: Date;
}
