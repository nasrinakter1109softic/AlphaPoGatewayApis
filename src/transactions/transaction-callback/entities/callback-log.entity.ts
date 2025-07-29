import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum TransactionLogKind {
  REQUEST = 'request',
  CALLBACK = 'callback',
}

export enum TransactionLogStatus {
  RECEIVED = 'received',
  PROCESSED = 'processed',
  FAILED = 'failed',
}
@Entity('callback_logs')
export class CallbackLog {
  @Column({ name: 'company_id' })
  companyId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  provider: string; // e.g. "alphapo"

  @Column({ length: 64 })
  eventType: string; // deposit | withdrawal | invoice | exchange

  @Column({ type: 'enum', enum: TransactionLogKind })
  kind: TransactionLogKind; // request / callback

  @Index()
  @Column({ type: 'varchar', name: 'source_type', length: 32, nullable: true })
  sourceType?: string | null; // deposit | withdrawal | invoice

  @Index()
  @Column({ name: 'source_id', type: 'int', nullable: true })
  sourceId: number | null;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'varchar', nullable: true })
  signature: string | null;

  @Column({ default: false })
  verified: boolean;

  @Column({
    type: 'enum',
    enum: TransactionLogStatus,
    default: TransactionLogStatus.RECEIVED,
  })
  status: TransactionLogStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
