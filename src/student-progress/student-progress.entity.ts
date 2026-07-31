import { Student } from 'src/students/student.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('student_subject_procedure_progress')
@Unique(['student', 'subjectProcedure'])
export class StudentProgress {
  @ApiProperty({ description: 'Student progress ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Student, description: 'Associated student' })
  @ManyToOne(() => Student, (student) => student.procedureProgress, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ApiProperty({ description: 'Student ID', example: 1 })
  @RelationId('student')
  student_id: number;

  @ApiProperty({
    type: () => SubjectProcedures,
    description: 'Associated subject procedure',
  })
  @ManyToOne(
    () => SubjectProcedures,
    (subjectProcedure) => subjectProcedure.studentProgress,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'subject_procedure_id' })
  subjectProcedure: SubjectProcedures;

  @ApiProperty({ description: 'Subject procedure ID', example: 1 })
  @RelationId('subjectProcedure')
  subject_procedure_id: number;

  @ApiProperty({
    description: 'Number of supervisor-approved completed procedures',
    example: 3,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  completed_count: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
