import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { DiagnosisSubmission } from 'src/diagnosis-submission/diagnosis-submission.entity';
import { DiagnosisSubmissionStatus } from 'src/diagnosis-submission/enums/diagnosis-submission-status.enum';
import { SupervisorService } from 'src/supervisors/supervisor.service';
import { DataSource } from 'typeorm';
import { ApproveReviewDto } from './dto/approve-review.dto';
import { SupervisorReview } from './supervisor-reviews.entity';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';

@Injectable()
export class SupervisorReviewsService {
  constructor(
    private readonly supervisorService: SupervisorService,
    private readonly dataSource: DataSource,
  ) {}
  async getPendingReviews(user: AuthenticatedUser) {
    const supervisor = await this.getSupervisor(user);

    const pendingReviews = await this.dataSource
      .getRepository(DiagnosisSubmission)
      .find({
        where: {
          supervisor: { id: supervisor.id },
          status: DiagnosisSubmissionStatus.PENDING_REVIEW,
        },
        relations: {
          clinicalCase: {
            patient: true,
          },
          student: { user: true },
          plannedProcedures: { subjectProcedure: true },
        },
      });

    const result = pendingReviews.map((submission) => ({
      submissionId: submission.id,
      clinicalCaseId: submission.clinicalCase.id,
      patientName: submission.clinicalCase.patient.full_name,
      studentName: submission.student.user.full_name,
      procedureCount: submission.plannedProcedures.length,
    }));
    return {
      pendingReviews: result,
    };
  }
  async getPendingReviewDetails(user: AuthenticatedUser, submissionId: number) {
    const supervisor = await this.getSupervisor(user);
    const submission = await this.dataSource
      .getRepository(DiagnosisSubmission)
      .findOne({
        where: {
          id: submissionId,
          supervisor: { id: supervisor.id },
          status: DiagnosisSubmissionStatus.PENDING_REVIEW,
        },
        relations: {
          student: {
            user: true,
          },
          clinicalCase: {
            patient: true,
            subject: true,
          },
          plannedProcedures: {
            subjectProcedure: true,
            answers: {
              selectedOptions: true,
              question: true,
            },
          },
          images: true,
        },
      });
    if (!submission) {
      throw new NotFoundException('submission not found');
    }

    return {
      id: submission.id,
      student: submission.student.user.full_name,
      patient: submission.clinicalCase.patient.full_name,
      status: submission.status,
      plannedProcedures: submission.plannedProcedures.map((procedure) => {
        return {
          id: procedure.id,
          toothNumber: procedure.toothNumber,
          notes: procedure.notes,
          procedureName: procedure.subjectProcedure.name,
          answers: procedure.answers.map((answer) => {
            return {
              question: answer.question.question,
              answer: answer.answer,
              selectedOptions:
                answer.selectedOptions.map((option) => ({
                  id: option.id,
                  label: option.label,
                })) ?? [],
            };
          }),
        };
      }),
      images: submission.images.map((image) => ({
        id: image.id,
        url: image.fileUrl,
      })),
    };
  }
  async approveReview(
    user: AuthenticatedUser,
    submissionId: number,
    dto: ApproveReviewDto,
  ) {
    const supervisor = await this.getSupervisor(user);
    return await this.dataSource.transaction(async (manager) => {
      let submission: DiagnosisSubmission | null = null;
      try {
        submission = await manager
          .getRepository(DiagnosisSubmission)
          .createQueryBuilder('submission')
          .setLock('pessimistic_write')
          .innerJoinAndSelect('submission.clinicalCase', 'clinicalCase')
          .innerJoinAndSelect('submission.supervisor', 'supervisor')
          .where('submission.id = :id', { id: submissionId })
          .andWhere('submission.supervisor_id = :supervisorId', {
            supervisorId: supervisor.id,
          })
          .andWhere('submission.status = :status', {
            status: DiagnosisSubmissionStatus.PENDING_REVIEW,
          })
          .getOne();
      } catch (error) {
        console.log(error);
        throw error;
      }

      if (!submission) {
        throw new NotFoundException('submission not found');
      }

      if (submission.supervisor.id !== supervisor.id) {
        throw new ConflictException(
          'You are not the supervisor of this submission.',
        );
      }

      if (submission.status !== DiagnosisSubmissionStatus.PENDING_REVIEW) {
        throw new ConflictException('This submission is not pending review.');
      }

      const reviewExist = await manager
        .getRepository(SupervisorReview)
        .findOne({
          where: {
            diagnosisSubmission: { id: submission.id },
          },
        });

      if (reviewExist) {
        throw new ConflictException(
          'This diagnosis has already been reviewed.',
        );
      }

      const clinicalCase = submission.clinicalCase;

      if (!clinicalCase) {
        throw new NotFoundException('clinical case not found');
      }

      if (clinicalCase.status !== ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW) {
        throw new BadRequestException('Invalid clinical case status');
      }

      const review = manager.getRepository(SupervisorReview).create({
        diagnosisSubmission: submission,
        supervisor: supervisor,
        notes: dto.notes,
      });
      await manager.getRepository(SupervisorReview).save(review);

      await manager.getRepository(DiagnosisSubmission).update(submission.id, {
        status: DiagnosisSubmissionStatus.APPROVED,
      });

      await manager.getRepository(ClinicalCase).update(clinicalCase.id, {
        status: ClinicalCaseStatus.TREATMENT_IN_PROGRESS,
      });

      return {
        message: 'Diagnosis approved successfully.',
      };
    });
  }
  private async getSupervisor(user: AuthenticatedUser) {
    const supervisor = await this.supervisorService.findByUserId(user.userId);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return supervisor;
  }
}
