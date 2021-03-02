import { Column, Entity, OneToMany } from "typeorm";
import Base from "./Base";
import Job from "./Job";
import Schedule from "./Schedule";

type Auth = "basic" | "apikey";

@Entity()
export default class RuntimeResource extends Base {
  @Column({ nullable: true })
  apiKey?: string;

  @Column()
  auth!: Auth;

  @Column()
  friendlyName!: string;

  @Column()
  hostname!: string;

  @Column({ default: true })
  https!: boolean;

  @Column({ nullable: true })
  password?: string;

  @Column()
  port!: number;

  @Column({ nullable: true })
  username?: string;

  @OneToMany(() => Job, (job) => job.schedule)
  job!: Job[];

  @OneToMany(() => Schedule, (schedule) => schedule.runtimeResource)
  schedule!: Schedule[];
}
