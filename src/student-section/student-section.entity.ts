import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('student_sections')
@Unique(['studentAcademicYear', 'clinicSection'])
export class StudentSection {
  @ApiProperty({ description: 'Record ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => StudentAcademicYear, description: 'Associated student academic year' })
  @ManyToOne(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.studentSections,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'student_academic_year_id' })
  studentAcademicYear: StudentAcademicYear;

  @ApiProperty({ type: () => ClinicSections, description: 'Associated clinic section' })
  @ManyToOne(
    () => ClinicSections,
    (clinicSection) => clinicSection.studentSections,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'clinic_section_id' })
  clinicSection: ClinicSections;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
