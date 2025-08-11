import { Roles } from 'src/role/entity/role.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true })
  path: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Roles, (role) => role.menus)
  roles: Roles[];
}
