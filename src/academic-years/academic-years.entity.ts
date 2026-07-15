import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'academic_years' })
export class AcademicYear {
  @ApiProperty({ description: 'Academic year ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Academic year label', example: '2024-2025' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  label: string;

  @ApiProperty({ description: 'Start date', example: '2024-09-01' })
  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @ApiProperty({ description: 'End date', example: '2025-06-30' })
  @Column({ type: 'date', nullable: false })
  end_date: Date;

  @ApiProperty({ description: 'Whether the academic year is active', example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiPropertyOptional({ type: () => [StudentAcademicYear], description: 'Student enrollments' })
  @OneToMany(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.academicYear,
  )
  studentAcademicYears: StudentAcademicYear[];
}
