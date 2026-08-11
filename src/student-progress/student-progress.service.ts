import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StudentProgress } from './student-progress.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { PlannedProceduresStatus } from 'src/planned-procedures/enum/planned-procedures-status.enum';
import { StudentService } from 'src/students/student.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { AwardedProcedureCredit } from './interfaces/award-procedure-credit.interface';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(StudentProgress)
    private readonly studentProgressRepository: Repository<StudentProgress>,
    @InjectRepository(SubjectProcedures)
    private readonly subjectProceduresRepository: Repository<SubjectProcedures>,
    private readonly studentService: StudentService,
    private readonly clinicalCaseService: ClinicalCaseService,
  ) {}

  /**
   * Awards academic credit for the procedures completed in one evaluated clinical case.
   * Runs inside the evaluation transaction, so the manager is required.
   */
  public async awardProcedureCredit(
    manager: EntityManager,
    studentId: number,
    clinicalCaseId: number,
  ) {
    // const completedProcedures = await manager
    //   .getRepository(PlannedProcedures)
    //   .createQueryBuilder('plannedProcedure')
    //   .innerJoinAndSelect(
    //     'plannedProcedure.subjectProcedure',
    //     'subjectProcedure',
    //   )
    //   .innerJoin('plannedProcedure.diagnosisSubmission', 'diagnosisSubmission')
    //   .where('diagnosisSubmission.clinical_case_id = :clinicalCaseId', {
    //     clinicalCaseId,
    //   })
    //   .andWhere('plannedProcedure.status = :status', {
    //     status: PlannedProceduresStatus.COMPLETED,
    //   })
    //   .getMany();
    const raw = await manager
      .getRepository(PlannedProcedures)
      .createQueryBuilder('pp')
      .select('pp.subject_procedure_id', 'subjectProcedureId')
      .addSelect('COUNT(*)', 'awarded')
      .innerJoin('pp.diagnosisSubmission', 'ds')
      .where('ds.clinical_case_id = :clinicalCaseId', { clinicalCaseId })
      .andWhere('pp.status = :status', {
        status: PlannedProceduresStatus.COMPLETED,
      })
      .groupBy('pp.subject_procedure_id')
      .getRawMany();

    const groupedProcedures: AwardedProcedureCredit[] = raw.map((row) => ({
      subjectProcedureId: Number(row.subjectProcedureId),
      awarded: Number(row.awarded),
    }));

    if (groupedProcedures.length === 0) {
      throw new ConflictException(
        'No completed procedures found for this clinical case.',
      );
    }

    await this.awardAcademicCredit(manager, studentId, groupedProcedures);

    return {
      awardedCredits: groupedProcedures,
    };
  }

  /**
   * Collapses the completed planned procedures into a credit count per subject procedure.
   */
  public groupCompletedProcedures(plannedProcedures: PlannedProcedures[]) {
    const counts = new Map<number, number>();

    for (const plannedProcedure of plannedProcedures) {
      const subjectProcedureId = plannedProcedure.subjectProcedure.id;
      counts.set(subjectProcedureId, (counts.get(subjectProcedureId) ?? 0) + 1);
    }

    return counts;
  }

  /**
   * Increments the student's completed counts, creating the progress rows on first credit.
   */
  public async awardAcademicCredit(
    manager: EntityManager,
    studentId: number,
    awards: AwardedProcedureCredit[],
  ) {
    if (awards.length === 0) {
      return;
    }

    // Seed the missing rows first. orIgnore leans on the (student, subject procedure)
    // unique constraint, so two evaluations awarding credit at once cannot duplicate a row.
    await manager
      .createQueryBuilder()
      .insert()
      .into(StudentProgress)
      .values(
        awards.map((award) => ({
          student: { id: studentId },
          subjectProcedure: { id: award.subjectProcedureId },
          completedCount: 0,
        })),
      )
      .orIgnore()
      .execute();

    // Each subject procedure receives a different awarded count,
    // therefore each progress row is incremented individually.
    // Increment in SQL rather than read-modify-write, so concurrent awards cannot lose credit.
    for (const award of awards) {
      await manager
        .createQueryBuilder()
        .update(StudentProgress)
        .set({ completedCount: () => `"completed_count" + :awarded` })
        .setParameter('awarded', award.awarded)
        .where('student_id = :studentId', { studentId })
        .andWhere('subject_procedure_id = :subjectProcedureId', {
          subjectProcedureId: award.subjectProcedureId,
        })
        .execute();
    }
  }

  /**
   * Progress dashboard for the signed-in student: every procedure required by the
   * subjects of their current study year, plus anything they already earned credit for.
   */
  public async getMyProcedureProgress(user: AuthenticatedUser) {
    const student = await this.studentService.findByUserId(user.userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const studyYear = await this.studentService.getCurrentStudyYear(
      user.userId,
    );

    const subjectProcedures = await this.subjectProceduresRepository
      .createQueryBuilder('subjectProcedure')
      .innerJoinAndSelect('subjectProcedure.subject', 'subject')
      .leftJoinAndSelect(
        'subjectProcedure.studentProgress',
        'progress',
        'progress.student_id = :studentId',
        { studentId: student.id },
      )
      .where(
        '(subject.study_year_id = :studyYearId AND subjectProcedure.is_active = true)',
        { studyYearId: studyYear.id },
      )
      // Keep already earned credit visible even if the procedure is no longer required.
      .orWhere('progress.id IS NOT NULL')
      .orderBy('subject.name', 'ASC')
      .addOrderBy('subjectProcedure.name', 'ASC')
      .getMany();

    const subjects = new Map<
      number,
      {
        subjectId: number;
        subject: string;
        procedures: {
          subjectProcedureId: number;
          procedure: string;
          completed: number;
          required: number;
        }[];
      }
    >();

    for (const subjectProcedure of subjectProcedures) {
      const subject = subjectProcedure.subject;
      if (!subjects.has(subject.id)) {
        subjects.set(subject.id, {
          subjectId: subject.id,
          subject: subject.name,
          procedures: [],
        });
      }

      subjects.get(subject.id)!.procedures.push({
        subjectProcedureId: subjectProcedure.id,
        procedure: subjectProcedure.name,
        completed: subjectProcedure.studentProgress[0]?.completedCount ?? 0,
        required: subjectProcedure.required_count,
      });
    }

    return {
      message: 'Procedure progress retrieved successfully.',
      progress: [...subjects.values()],
    };
  }
  public async getSubjectDetailsWithProgressAndCases(
    user: AuthenticatedUser,
    subjectId: number,
  ) {
    const student = await this.studentService.findByUserId(user.userId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const studyYear = await this.studentService.getCurrentStudyYear(
      user.userId,
    );

    const sectionSubject =
      await this.studentService.getSectionSubjectForStudent(
        user.userId,
        subjectId,
      );

    const subjectProcedures = await this.subjectProceduresRepository
      .createQueryBuilder('subjectProcedure')
      .innerJoinAndSelect('subjectProcedure.subject', 'subject')
      .leftJoinAndSelect(
        'subjectProcedure.studentProgress',
        'progress',
        'progress.student_id = :studentId',
        { studentId: student.id },
      )
      .where(
        '(subject.study_year_id = :studyYearId AND subjectProcedure.is_active = true AND subject.id = :subjectId)',
        { studyYearId: studyYear.id, subjectId },
      )
      // Keep already earned credit visible even if the procedure is no longer required.
      .orWhere('progress.id IS NOT NULL')
      .orderBy('subject.name', 'ASC')
      .addOrderBy('subjectProcedure.name', 'ASC')
      .getMany();

    const subjects = new Map<
      number,
      {
        subjectId: number;
        subject: string;
        section: string;
        supervisor: string;
        procedures: {
          subjectProcedureId: number;
          procedure: string;
          completed: number;
          required: number;
        }[];
        cases: any;
      }
    >();

    const cases = await this.clinicalCaseService.findStudentCasesInSubject(
      user.userId,
      subjectId,
    );
    for (const subjectProcedure of subjectProcedures) {
      const subject = subjectProcedure.subject;
      if (!subjects.has(subject.id)) {
        subjects.set(subject.id, {
          subjectId: subject.id,
          subject: subject.name,
          section: sectionSubject.section.name,
          supervisor: sectionSubject.supervisor.user.full_name,
          procedures: [],
          cases,
        });
      }

      subjects.get(subject.id)!.procedures.push({
        subjectProcedureId: subjectProcedure.id,
        procedure: subjectProcedure.name,
        completed: subjectProcedure.studentProgress[0]?.completedCount ?? 0,
        required: subjectProcedure.required_count,
      });
    }

    return {
      message: 'Procedure progress retrieved successfully.',
      ...subjects.values().next().value,
    };
  }
}
