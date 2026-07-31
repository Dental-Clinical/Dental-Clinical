import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalCaseEvaluation } from './clinical-case-evaluation.entity';
import { DataSource, Repository } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { CreateClinicalCaseEvaluationDto } from './dto/create-clinical-case-evaluation.dto';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SupervisorService } from 'src/supervisors/supervisor.service';
import { UpdateClinicalCaseEvaluationDto } from './dto/update-clinical-case-evaluation.dto';
import { User } from 'src/users/user.entity';
import { UserRole } from 'src/constants/user-roles';
import { GetClinicalCaseEvaluationsQueryDto } from './dto/get-clinical-case-evaluations-query.dto';
import { StudentService } from 'src/students/student.service';
import { StudentProgressService } from 'src/student-progress/student-progress.service';

@Injectable()
export class ClinicalCaseEvaluationService {
  constructor(
    @InjectRepository(ClinicalCaseEvaluation) readonly clinicalCaseEvaluationRepository: Repository<ClinicalCaseEvaluation>,
    @InjectRepository(ClinicalCase) readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly supervisorService: SupervisorService,
    private readonly studentService: StudentService,
    private readonly studentProgressService: StudentProgressService,
    private readonly dataSource: DataSource,
  ) { }
  async createClinicalCaseEvaluation(
    user: AuthenticatedUser,
    clinicalCaseId: number,
    dto: CreateClinicalCaseEvaluationDto,
  ) {
    const supervisor = await this.supervisorService.findByUserId(user.userId)
    if (!supervisor) {
      throw new NotFoundException("Supervisor not found")
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ClinicalCase).findOne({
        where: { id: clinicalCaseId },
        lock: {
          mode: 'pessimistic_write',
        },
      })

      const clinicalCase = await manager.getRepository(ClinicalCase).findOne({
        where: { id: clinicalCaseId },
        relations: {
          assignedSupervisor: true,
          assignedStudent: true,
        },
      })
      if (!clinicalCase) {
        throw new NotFoundException("Clinical Case Not Found")
      }
      if (clinicalCase.assignedSupervisor?.id !== supervisor.id) {
        throw new ForbiddenException("You do not supervise this clinical case")
      }
      if (clinicalCase.status !== ClinicalCaseStatus.AWAITING_CASE_REVIEW) {
        throw new ConflictException("Case is not finalized yet")
      }

      const student = clinicalCase.assignedStudent
      if (!student) {
        throw new NotFoundException("Student not found for this clinical case")
      }

      const existingEvaluation = await manager
        .getRepository(ClinicalCaseEvaluation)
        .findOneBy({
          clinicalCase: { id: clinicalCase.id },
        })
      if (existingEvaluation) {
        throw new ConflictException("An evaluation already exists")
      }

      const evaluation = manager.getRepository(ClinicalCaseEvaluation).create({
        student,
        grade: dto.grade,
        supervisor,
        clinicalCase,
        comment: dto.comment,
      })
      await manager.getRepository(ClinicalCaseEvaluation).save(evaluation)

      // Academic credit is awarded in the same transaction, so the evaluation, the
      // student's progress and the completed status commit or roll back together.
      await this.studentProgressService.awardProcedureCredit(
        manager,
        student.id,
        clinicalCase.id,
      )

      clinicalCase.status = ClinicalCaseStatus.COMPLETED
      await manager.getRepository(ClinicalCase).save(clinicalCase)

      return {
        message: 'Clinical case evaluated successfully.',
        id: evaluation.id,
        clinicalCaseId: clinicalCase.id,
        studentId: student.id,
        supervisorId: supervisor.id,
        grade: evaluation.grade,
        comment: evaluation.comment,
        createdAt: evaluation.createdAt,
      }
    })
  }

  async updateClinicalCaseEvaluation(id: number, user: AuthenticatedUser, dto: UpdateClinicalCaseEvaluationDto) {
    const changes: Partial<ClinicalCaseEvaluation> = {}
    if (dto.grade !== undefined) {
      changes.grade = dto.grade
    }
    if (dto.comment !== undefined) {
      changes.comment = dto.comment
    }
    if (Object.keys(changes).length === 0) {
      throw new BadRequestException("No fields to update")
    }

    const evaluation = await this.clinicalCaseEvaluationRepository.findOne({
      where: { id },
      relations: {
        clinicalCase: { assignedSupervisor: { user: true } },
      },
      select: {
        id: true,
        grade: true,
        comment: true,
        clinicalCase: {
          id: true,
          assignedSupervisor: {
            id: true,
            user: { id: true },
          },
        },
      },
    })
    if (!evaluation) {
      throw new NotFoundException("Evaluation Not Found")
    }

    const assignedSupervisor = evaluation.clinicalCase.assignedSupervisor
    if (assignedSupervisor?.user?.id !== user.userId) {
      throw new ForbiddenException("You are not authorized to make this edit")
    }

    await this.clinicalCaseEvaluationRepository.update(id, changes)

    return {
      message: 'Clinical case evaluation updated successfully.',
      id: evaluation.id,
      clinicalCaseId: evaluation.clinicalCase.id,
      supervisorId: assignedSupervisor.id,
      grade: changes.grade ?? evaluation.grade,
      comment: changes.comment ?? evaluation.comment,
    }
  }

  async getClinicalCaseEvaluation(id: number, user: AuthenticatedUser) {
    const isSupervisor = user.role === UserRole.SUPERVISOR
    const isStudent = user.role === UserRole.STUDENT

    const evaluation = await this.clinicalCaseEvaluationRepository.findOne({
      where: { id },
      relations: {
        clinicalCase: true,
        student: { user: true },
        supervisor: { user: true },
      },
      select: {
        id: true,
        grade: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        clinicalCase: { id: true, status: true },
        student: { id: true, user: { id: true, full_name: true } },
        supervisor: { id: true, user: { id: true, full_name: true } },
      },
    })
    if (!evaluation) {
      throw new NotFoundException("Evaluation Not Found")
    }

    const owner = isStudent ? evaluation.student : evaluation.supervisor
    if (owner?.user?.id !== user.userId) {
      throw new ForbiddenException("You are not allowed to view this evaluation")
    }

    return {
      id: evaluation.id,
      clinicalCaseId: evaluation.clinicalCase.id,
      clinicalCaseStatus: evaluation.clinicalCase.status,
      studentId: evaluation.student.id,
      studentName: evaluation.student.user.full_name,
      supervisorId: evaluation.supervisor.id,
      supervisorName: evaluation.supervisor.user.full_name,
      grade: evaluation.grade,
      comment: evaluation.comment,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
    }
  }

  async getAllClinicalCasesEvaluations(user: AuthenticatedUser, dto: GetClinicalCaseEvaluationsQueryDto) {
    if (dto.fromDate !== undefined && dto.toDate !== undefined && dto.fromDate > dto.toDate) {
      throw new BadRequestException("fromDate cannot be later than toDate")
    }

    const student = await this.studentService.findByUserId(user.userId)
    if (!student) {
      throw new NotFoundException("Student not found")
    }

    const qb = this.clinicalCaseEvaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.clinicalCase', 'clinicalCase')
      .innerJoin('clinicalCase.subject', 'subject')
      .innerJoin('evaluation.supervisor', 'supervisor')
      .innerJoin('supervisor.user', 'supervisorUser')
      .where('evaluation.student_id = :studentId', { studentId: student.id })

    if (dto.subjectId !== undefined) {
      qb.andWhere('clinicalCase.subject_id = :subjectId', { subjectId: dto.subjectId })
    }
    if (dto.fromDate !== undefined) {
      qb.andWhere('evaluation.createdAt >= :fromDate', { fromDate: dto.fromDate })
    }
    if (dto.toDate !== undefined) {
      qb.andWhere('evaluation.createdAt <= :toDate', { toDate: dto.toDate })
    }

    const [evaluations, total] = await qb
      .select([
        'evaluation.id',
        'evaluation.grade',
        'evaluation.comment',
        'evaluation.createdAt',
        'evaluation.updatedAt',
        'clinicalCase.id',
        'clinicalCase.status',
        'subject.id',
        'subject.name',
        'supervisor.id',
        'supervisorUser.id',
        'supervisorUser.full_name',
      ])
      .orderBy('evaluation.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit)
      .getManyAndCount()

    return {
      message: 'Clinical case evaluations retrieved successfully.',
      data: evaluations.map((evaluation) => ({
        id: evaluation.id,
        clinicalCaseId: evaluation.clinicalCase.id,
        clinicalCaseStatus: evaluation.clinicalCase.status,
        subjectId: evaluation.clinicalCase.subject.id,
        subjectName: evaluation.clinicalCase.subject.name,
        supervisorId: evaluation.supervisor.id,
        supervisorName: evaluation.supervisor.user.full_name,
        grade: evaluation.grade,
        comment: evaluation.comment,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      })),
      // Counted over the whole filtered set, so pagination never skews it.
      summary: {
        count: total,
      },
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    }
  }

}
