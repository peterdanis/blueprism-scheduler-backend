import { BaseEntity, PrimaryGeneratedColumn } from "typeorm";

export default class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
}
