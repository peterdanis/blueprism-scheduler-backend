import { Column, Entity } from "typeorm";
import Base from "./Base";

@Entity()
export default class RuntimeResource extends Base {
  @Column()
  hostname!: string;

  @Column()
  friendlyName!: string;
}
