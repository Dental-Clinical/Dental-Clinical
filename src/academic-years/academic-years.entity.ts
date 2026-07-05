import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'academic_years' })
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255, nullable: false })
  label: string;
  @Column({ type: 'date', nullable: false })
  start_date: Date;
  @Column({ type: 'date', nullable: false })
  end_date: Date;
  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
