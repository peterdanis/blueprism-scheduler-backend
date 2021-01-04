import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Schedule extends Base {
  @Column()
  name!: string;

  @Column()
  schedule!: string;

  @Column()
  validFrom!: Date;

  @Column({ default: new Date(253402214400000).toISOString() })
  validUntil!: Date;
}
