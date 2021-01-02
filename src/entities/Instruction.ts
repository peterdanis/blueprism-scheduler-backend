import { Column, Entity } from "typeorm";
import Base from "./Base";

interface Input {
  "@name": string;
  "@value": string;
  "@type": "text";
}

@Entity()
export default class Instruction extends Base {
  @Column()
  inputs!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  process!: string;

  @Column()
  timeout!: number;
}
