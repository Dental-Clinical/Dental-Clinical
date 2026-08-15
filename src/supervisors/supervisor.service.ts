import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { Supervisor } from './supervisor.entity';
import { DataSource } from 'typeorm';
import { PasswordService } from 'src/common/services/password.service';
import { User } from 'src/users/user.entity';
import { randomBytes } from 'crypto';
import { UserRole } from 'src/constants/user-roles';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { DiagnosisSubmissionStatus } from 'src/diagnosis-submission/enums/diagnosis-submission-status.enum';
import { SupervisorScheduleService } from 'src/supervisor-schedules/supervisor-schedules.service';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { SubjectProcedures } from 'src/subject-procedures/subject-procedures.entity';
import { StudentProgress } from 'src/student-progress/student-progress.entity';
import {
  DashboardCaseBucketsDto,
  DashboardSubjectDto,
  SupervisorDashboardResponseDto,
} from './dto/supervisor-dashboard-response.dto';

const CASE_STATUS_BUCKETS: Record<
  keyof DashboardCaseBucketsDto,
  ClinicalCaseStatus[]
> = {
  under_treatment: [ClinicalCaseStatus.TREATMENT_IN_PROGRESS],
  awaiting_approval: [ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW],
  completed: [ClinicalCaseStatus.COMPLETED],
  final_evaluation: [ClinicalCaseStatus.AWAITING_CASE_REVIEW],
};

@Injectable()
export class SupervisorService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly dataSource: DataSource,
    private readonly whatsappService: WhatsappService,
    private readonly supervisorScheduleService: SupervisorScheduleService,
  ) {}
  async getSupervisors() {
    const supervisors = await this.dataSource.getRepository(Supervisor).find({
      relations: {
        user: true,
      },
    });
    return supervisors.map((supervisor) => ({
      id: supervisor.id,
      full_name: supervisor.user.full_name,
    }));
  }
  async createSupervisor(dto: CreateSupervisorDto) {
    return await this.dataSource.transaction(async (manager) => {
      dto.email = dto.email.trim().toLowerCase();
      dto.phone = dto.phone.replace(/\D/g, '');

      const existingUser = await manager.getRepository(User).findOne({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      const tempPassword = randomBytes(8).toString('hex');

      const passwordHash = await this.passwordService.hash(tempPassword);

      const user = manager.getRepository(User).create({
        full_name: dto.full_name,
        father_name: dto.father_name,
        role: UserRole.SUPERVISOR,
        email: dto.email,
        phone: dto.phone,
        password_hash: passwordHash,
      });

      // this.whatsappService.sendPassword(tempPassword, dto.phone);
      console.log(tempPassword);

      const savedUser = await manager.save(user);

      const newSupervisor = manager.getRepository(Supervisor).create({
        user: savedUser,
      });
      const savedSupervisor = await manager.save(newSupervisor);

      const supervisorSchedules =
        await this.supervisorScheduleService.createSchedule(
          savedSupervisor,
          dto.schedules,
          manager,
        );
      return {
        supervisorId: savedSupervisor.id,
        tempPassword,
      };
    });
  }
  async getAssignedClinicalCases(user: AuthenticatedUser) {
    const supervisor = await this.findByUserId(user.userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const clinicalCases = await this.dataSource
      .getRepository(ClinicalCase)
      .createQueryBuilder('clinical_case')
      .leftJoinAndSelect('clinical_case.patient', 'patient')
      .leftJoinAndSelect('clinical_case.assignedStudent', 'student')
      .leftJoinAndSelect('student.user', 'student_user')
      .leftJoinAndSelect(
        'clinical_case.diagnosisSubmission',
        'diagnosis_submission',
      )
      .leftJoinAndSelect(
        'clinical_case.plannedProcedures',
        'planned_procedures',
      )
      .leftJoinAndSelect(
        'planned_procedures.subjectProcedure',
        'subject_procedure',
      )
      .where('diagnosis_submission.supervisor_id = :supervisorId', {
        supervisorId: supervisor.id,
      })
      .andWhere('diagnosis_submission.status IN (:...statuses)', {
        statuses: [
          DiagnosisSubmissionStatus.PENDING_REVIEW,
          DiagnosisSubmissionStatus.APPROVED,
        ],
      })
      .getMany();

    const result = clinicalCases.map((clinicalCase) => {
      return {
        id: clinicalCase.id,
        patientName: clinicalCase.patient.full_name,
        studentName: clinicalCase.assignedStudent.user.full_name,
        status: clinicalCase.status,
        procedures: clinicalCase.plannedProcedures.map((procedure) => ({
          id: procedure.id,
          name: procedure.subjectProcedure.name,
          tooth: procedure.toothNumber,
        })),
      };
    });
    return {
      cases: result,
    };
  }
  async getDashboard(
    user: AuthenticatedUser,
  ): Promise<SupervisorDashboardResponseDto> {
    const supervisor = await this.findByUserId(user.userId);
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const subjectRows = await this.dataSource
      .getRepository(SectionSubject)
      .createQueryBuilder('sectionSubject')
      .innerJoin('sectionSubject.subject', 'subject')
      .innerJoin('sectionSubject.academicYear', 'academicYear')
      .innerJoin('sectionSubject.supervisor', 'supervisor')
      .innerJoin('supervisor.user', 'supervisorUser')
      .select('subject.id', 'subjectId')
      .addSelect('subject.name', 'subjectName')
      .where('supervisorUser.id = :userId', { userId: user.userId })
      .andWhere('academicYear.is_active = true')
      .andWhere('subject.is_active = true')
      .groupBy('subject.id')
      .addGroupBy('subject.name')
      .getRawMany<{ subjectId: string; subjectName: string }>();

    if (subjectRows.length === 0) {
      return {
        stats: { total_students: 0, total_subjects: 0, total_cases: 0 },
        subjects: [],
      };
    }

    const subjectIds = subjectRows.map((row) => Number(row.subjectId));

    const enrollmentRows = await this.dataSource
      .getRepository(StudentSubjectEnrollment)
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.student', 'student')
      .innerJoin('student.user', 'user')
      .innerJoin('enrollment.subject', 'subject')
      .innerJoin('enrollment.academicYear', 'academicYear')
      .innerJoin(
        SectionSubject,
        'sectionSubject',
        'sectionSubject.section_id = enrollment.section_id AND sectionSubject.subject_id = enrollment.subject_id AND sectionSubject.academic_year_id = enrollment.academic_year_id',
      )
      .innerJoin('sectionSubject.supervisor', 'supervisor')
      .innerJoin('supervisor.user', 'supervisorUser')
      .select('student.id', 'studentId')
      .addSelect('subject.id', 'subjectId')
      .distinct(true)
      .where('supervisorUser.id = :userId', { userId: user.userId })
      .andWhere('academicYear.is_active = true')
      .andWhere('subject.is_active = true')
      .andWhere('user.is_active = true')
      .getRawMany<{ studentId: string; subjectId: string }>();

    const totalStudents = new Set(
      enrollmentRows.map((row) => Number(row.studentId)),
    ).size;
    const studentsBySubject = new Map<number, number>();
    for (const row of enrollmentRows) {
      const subjectId = Number(row.subjectId);
      studentsBySubject.set(
        subjectId,
        (studentsBySubject.get(subjectId) ?? 0) + 1,
      );
    }

    const [caseRows, procedureRows, progressRows] = await Promise.all([
      // Cases are scoped through enrollments rather than assigned_supervisor_id,
      // which is nulled when a case changes subject.
      this.dataSource
        .getRepository(ClinicalCase)
        .createQueryBuilder('clinical_case')
        .innerJoin(
          StudentSubjectEnrollment,
          'enrollment',
          'enrollment.student_id = clinical_case.assigned_student_id AND enrollment.subject_id = clinical_case.subject_id',
        )
        .innerJoin('enrollment.student', 'student')
        .innerJoin('student.user', 'user')
        .innerJoin('enrollment.subject', 'subject')
        .innerJoin('enrollment.academicYear', 'academicYear')
        .innerJoin(
          SectionSubject,
          'sectionSubject',
          'sectionSubject.section_id = enrollment.section_id AND sectionSubject.subject_id = enrollment.subject_id AND sectionSubject.academic_year_id = enrollment.academic_year_id',
        )
        .innerJoin('sectionSubject.supervisor', 'supervisor')
        .innerJoin('supervisor.user', 'supervisorUser')
        .select('clinical_case.subject_id', 'subjectId')
        .addSelect('clinical_case.status', 'status')
        .addSelect('COUNT(DISTINCT clinical_case.id)', 'count')
        .where('supervisorUser.id = :userId', { userId: user.userId })
        .andWhere('academicYear.is_active = true')
        .andWhere('subject.is_active = true')
        .andWhere('user.is_active = true')
        .groupBy('clinical_case.subject_id')
        .addGroupBy('clinical_case.status')
        .getRawMany<{
          subjectId: string;
          status: ClinicalCaseStatus;
          count: string;
        }>(),
      this.dataSource
        .getRepository(SubjectProcedures)
        .createQueryBuilder('subjectProcedure')
        .select('subjectProcedure.id', 'procedureId')
        .addSelect('subjectProcedure.name', 'name')
        .addSelect('subjectProcedure.required_count', 'requiredCount')
        .addSelect('subjectProcedure.subject_id', 'subjectId')
        .where('subjectProcedure.subject_id IN (:...subjectIds)', {
          subjectIds,
        })
        .andWhere('subjectProcedure.is_active = true')
        .orderBy('subjectProcedure.name', 'ASC')
        .getRawMany<{
          procedureId: string;
          name: string;
          requiredCount: string;
          subjectId: string;
        }>(),
      this.dataSource
        .getRepository(StudentProgress)
        .createQueryBuilder('progress')
        .innerJoin('progress.subjectProcedure', 'subjectProcedure')
        .innerJoin(
          StudentSubjectEnrollment,
          'enrollment',
          'enrollment.student_id = progress.student_id AND enrollment.subject_id = subjectProcedure.subject_id',
        )
        .innerJoin('enrollment.student', 'student')
        .innerJoin('student.user', 'user')
        .innerJoin('enrollment.academicYear', 'academicYear')
        .innerJoin(
          SectionSubject,
          'sectionSubject',
          'sectionSubject.section_id = enrollment.section_id AND sectionSubject.subject_id = enrollment.subject_id AND sectionSubject.academic_year_id = enrollment.academic_year_id',
        )
        .innerJoin('sectionSubject.supervisor', 'supervisor')
        .innerJoin('supervisor.user', 'supervisorUser')
        .select('subjectProcedure.id', 'procedureId')
        .addSelect(
          'COUNT(DISTINCT CASE WHEN progress.completed_count >= subjectProcedure.required_count THEN progress.student_id END)',
          'studentsCompleted',
        )
        .addSelect(
          'SUM(LEAST(progress.completed_count, subjectProcedure.required_count))',
          'totalCompleted',
        )
        .where('supervisorUser.id = :userId', { userId: user.userId })
        .andWhere('subjectProcedure.subject_id IN (:...subjectIds)', {
          subjectIds,
        })
        .andWhere('subjectProcedure.is_active = true')
        .andWhere('academicYear.is_active = true')
        .andWhere('user.is_active = true')
        .groupBy('subjectProcedure.id')
        .getRawMany<{
          procedureId: string;
          studentsCompleted: string;
          totalCompleted: string;
        }>(),
    ]);

    const caseCountsBySubject = new Map<number, Map<string, number>>();
    let totalCases = 0;
    for (const row of caseRows) {
      const subjectId = Number(row.subjectId);
      const count = Number(row.count);
      totalCases += count;
      if (!caseCountsBySubject.has(subjectId)) {
        caseCountsBySubject.set(subjectId, new Map());
      }
      caseCountsBySubject.get(subjectId)!.set(row.status, count);
    }

    const progressByProcedure = new Map(
      progressRows.map((row) => [
        Number(row.procedureId),
        {
          studentsCompleted: Number(row.studentsCompleted),
          totalCompleted: Number(row.totalCompleted),
        },
      ]),
    );

    const subjects: DashboardSubjectDto[] = subjectRows.map((subjectRow) => {
      const subjectId = Number(subjectRow.subjectId);
      const studentsCount = studentsBySubject.get(subjectId) ?? 0;
      const statusCounts = caseCountsBySubject.get(subjectId);

      const cases = Object.fromEntries(
        Object.entries(CASE_STATUS_BUCKETS).map(([bucket, statuses]) => [
          bucket,
          statuses.reduce(
            (sum, status) => sum + (statusCounts?.get(status) ?? 0),
            0,
          ),
        ]),
      ) as unknown as DashboardCaseBucketsDto;

      const procedures = procedureRows
        .filter((row) => Number(row.subjectId) === subjectId)
        .map((row) => {
          const requiredCount = Number(row.requiredCount);
          const progress = progressByProcedure.get(Number(row.procedureId));
          return {
            procedure_id: Number(row.procedureId),
            name: row.name,
            required_count: requiredCount,
            students_total: studentsCount,
            students_completed: progress?.studentsCompleted ?? 0,
            total_completed: progress?.totalCompleted ?? 0,
            total_required: requiredCount * studentsCount,
          };
        });

      return {
        subject_id: subjectId,
        subject_name: subjectRow.subjectName,
        students_count: studentsCount,
        cases,
        procedures,
      };
    });

    return {
      stats: {
        total_students: totalStudents,
        total_subjects: subjects.length,
        // Cases in statuses outside the four buckets (open/assigned) still
        // count toward the total.
        total_cases: totalCases,
      },
      subjects,
    };
  }
  async findByUserId(userId: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { user: { id: userId } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
  async findById(id: number) {
    return await this.dataSource.getRepository(Supervisor).findOne({
      where: { id, user: { is_active: true } },
      relations: {
        user: true,
        schedules: true,
      },
    });
  }
}
