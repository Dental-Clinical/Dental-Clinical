import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClinicalCaseEvaluation } from './clinical-case-evaluation.entity';
import { DataSource, Repository } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { CreateClinicalCaseEvaluationDto } from './dto/create-clinical-case-evaluation.dto';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SupervisorService } from 'src/supervisors/supervisor.service';

@Injectable()
export class ClinicalCaseEvaluationService {
  constructor(
    @InjectRepository(ClinicalCaseEvaluation) readonly clinicalCaseEvaluationRepository: Repository<ClinicalCaseEvaluation>,
    @InjectRepository(ClinicalCase) readonly clinicalCaseRepository: Repository<ClinicalCase>,
    private readonly supervisorService: SupervisorService,
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

}
