import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  roleId: number;

  @Column({ nullable: false })
  roleName: string;
}
