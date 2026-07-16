import { InitialExamination } from '../initial-examination/initial-examination.entity';
import { StudyYear } from '../study-years/study-years.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ClinicalCase } from '../clinical-case/clinical-case.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { ClinicSections } from 'src/clinic-sections/clinic-sections.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('subjects')
@Unique(['studyYear', 'name'])
export class Subject {
  @ApiProperty({ description: 'Subject ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => StudyYear, description: 'Associated study year' })
  @ManyToOne(() => StudyYear, (studyYear) => studyYear.subjects)
  @JoinColumn({ name: 'study_year_id' })
  studyYear: StudyYear;

  @ApiProperty({ description: 'Study year ID', example: 1 })
  @RelationId('studyYear')
  study_year_id: number;

  @ApiProperty({ description: 'Subject name', example: 'Restorative Dentistry' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ApiPropertyOptional({ description: 'Subject description', example: 'Covers restorative procedures' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Whether the subject is active', example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiPropertyOptional({ type: () => [InitialExamination], description: 'Initial examinations' })
  @OneToMany(() => InitialExamination, (examination) => examination.subject)
  initialExaminations: InitialExamination[];

  @ApiPropertyOptional({ type: () => [ClinicalCase], description: 'Clinical cases' })
  @OneToMany(() => ClinicalCase, (clinicalCase) => clinicalCase.subject)
  clinicalCases: ClinicalCase[];

  @ApiPropertyOptional({ type: () => [SubjectProcedures], description: 'Subject procedures' })
  @OneToMany(
    () => SubjectProcedures,
    (subjectProcedure) => subjectProcedure.subject,
  )
  subjectProcedures: SubjectProcedures[];

  @ApiPropertyOptional({ type: () => [ClinicSections], description: 'Clinic sections' })
  @OneToMany(() => ClinicSections, (clinicSection) => clinicSection.subject)
  clinicSections: ClinicSections[];
}
