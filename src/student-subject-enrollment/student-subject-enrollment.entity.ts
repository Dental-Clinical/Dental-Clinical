import { AcademicYear } from "src/academic-years/academic-years.entity";
import { Section } from "src/section/section.entity";
import { Student } from "src/students/student.entity";
import { Subject } from "src/subjects/subjects.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('student_subject_enrollments')
@Unique([
  'student',
  'subject',
  'academicYear'
])
export class StudentSubjectEnrollment {

  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Student,
    student => student.subjectEnrollment,
    { nullable: false },
  )
  @JoinColumn({ name: 'student_id' })
  student: Student

  @ManyToOne(() => Subject, { nullable: false })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject

  @ManyToOne(() => Section, { nullable: false })
  @JoinColumn({ name: 'section_id' })
  section: Section

  @ManyToOne(() => AcademicYear, { nullable: false })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear

}
