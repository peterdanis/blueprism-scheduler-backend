import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class Setting extends Base {
  @Column({ unique: true })
  key!: string;

  @Column()
  value!: string;
}
