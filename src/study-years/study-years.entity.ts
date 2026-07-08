import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { Subject } from '../subjects/subjects.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'study_years' })
export class StudyYear {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;
  @Column({ type: 'int', nullable: false })
  level: number;
  @OneToMany(() => Subject, (subject) => subject.studyYear)
  subjects: Subject[];
  @OneToMany(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.studyYear,
  )
  studentAcademicYears: StudentAcademicYear[];
}
