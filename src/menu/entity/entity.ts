import { Entity, PrimaryGeneratedColumn, Column , CreateDateColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  path?: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
