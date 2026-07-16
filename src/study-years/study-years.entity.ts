import { StudentAcademicYear } from 'src/student-academic-years/student-academic-years.entity';
import { Subject } from '../subjects/subjects.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'study_years' })
export class StudyYear {
  @ApiProperty({ description: 'Study year ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Study year name', example: 'First Year' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiProperty({ description: 'Study year level', example: 1 })
  @Column({ type: 'int', nullable: false })
  level: number;

  @ApiPropertyOptional({ type: () => [Subject], description: 'Subjects in this study year' })
  @OneToMany(() => Subject, (subject) => subject.studyYear)
  subjects: Subject[];

  @ApiPropertyOptional({ type: () => [StudentAcademicYear], description: 'Student enrollments' })
  @OneToMany(
    () => StudentAcademicYear,
    (studentAcademicYear) => studentAcademicYear.studyYear,
  )
  studentAcademicYears: StudentAcademicYear[];
}
