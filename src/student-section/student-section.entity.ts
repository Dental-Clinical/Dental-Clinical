import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/** @deprecated Superseded by {@link StudentSubjectEnrollment}. */
@Entity('student_sections')
@Unique(['studentAcademicYear', 'clinicSection'])
export class StudentSection {
  @ApiProperty({ description: 'Record ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => StudentAcademicYear,
    description: 'Associated student academic year',
  })
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

  @ApiProperty({ description: 'Student academic year ID', example: 1 })
  @RelationId('studentAcademicYear')
  student_academic_year_id: number;

  @ApiProperty({
    type: () => ClinicSections,
    description: 'Associated clinic section',
  })
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

  @ApiProperty({ description: 'Clinic section ID', example: 1 })
  @RelationId('clinicSection')
  clinic_section_id: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
