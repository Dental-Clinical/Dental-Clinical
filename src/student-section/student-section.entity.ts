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

@Entity('student_sections')
@Unique(['studentAcademicYear', 'clinicSection'])
export class StudentSection {
  @PrimaryGeneratedColumn()
  id: number;

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

  @CreateDateColumn()
  createdAt: Date;
}
