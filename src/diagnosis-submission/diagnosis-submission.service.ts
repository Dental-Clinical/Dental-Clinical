import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiagnosisSubmissionDto } from './dto/create-diagnosis-submission.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { StudentService } from 'src/students/student.service';
import { EntityManager } from 'typeorm';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { ClinicalAppointment } from 'src/clinical-appointments/clinical-appointments.entity';
import { ClinicalAppointmentStatus } from 'src/clinical-appointments/enums/clinical-appointment.enum';
import { DiagnosisSubmission } from './diagnosis-submission.entity';
import { PlannedProcedures } from 'src/planned-procedures/planned-procedures.entity';
import { DiagnosisSubmissionStatus } from './enums/diagnosis-submission-status.enum';
import { DiagnosisImages } from 'src/diagnosis-images/diagnosis-images.entity';
import { unlink } from 'fs/promises';

@Injectable()
export class DiagnosisSubmissionService {
  constructor(
    private readonly studentService: StudentService,
    private readonly dataSource: EntityManager,
  ) {}
  async submitDiagnosis(
    dto: CreateDiagnosisSubmissionDto,
    user: AuthenticatedUser,
    files: Express.Multer.File[],
  ) {
    const student = await this.studentService.findByUserId(user.userId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const clinicalCase = await this.dataSource
      .getRepository(ClinicalCase)
      .findOne({
        where: { id: dto.clinicalCaseId, assignedStudent: { id: student.id } },
        relations: {
          assignedStudent: true,
          assignedSupervisor: {
            user: true,
          },
          subject: {
            subjectProcedures: true,
          },
        },
      });

    if (!clinicalCase) {
      throw new NotFoundException(
        'Clinical case not found or not assigned to the student',
      );
    }

    if (clinicalCase.status !== ClinicalCaseStatus.ASSIGNED) {
      throw new ConflictException(
        'Clinical case is not ready for diagnosis submission',
      );
    }

    if (!clinicalCase.assignedSupervisor) {
      throw new ConflictException('Clinical case has no assigned supervisor');
    }
    if (!clinicalCase.assignedSupervisor.user.is_active) {
      throw new ConflictException('Assigned supervisor is inactive');
    }

    const clinicalCaseAppointment = await this.dataSource
      .getRepository(ClinicalAppointment)
      .findOne({
        where: {
          clinicalCase: { id: clinicalCase.id },
          student: { id: clinicalCase.assignedStudent.id },
          supervisor: { id: clinicalCase.assignedSupervisor.id },
          status: ClinicalAppointmentStatus.SCHEDULED,
        },
      });
    if (!clinicalCaseAppointment) {
      throw new ConflictException(
        'No scheduled appointment found for this clinical case',
      );
    }
    if (clinicalCaseAppointment.appointmentDate > new Date()) {
      throw new ConflictException(
        'Cannot submit diagnosis before the scheduled appointment date',
      );
    }
    const allowedProcedures = new Set(
      clinicalCase.subject.subjectProcedures
        .filter((p) => p.is_active)
        .map((p) => p.id),
    );

    for (const procedure of dto.plannedProcedures) {
      if (!allowedProcedures.has(procedure.subjectProcedureId)) {
        throw new ConflictException(
          `Procedure with ID ${procedure.subjectProcedureId} is not allowed for this subject`,
        );
      }
    }

    const seen = new Set<string>();

    for (const p of dto.plannedProcedures) {
      const key = `${p.toothNumber}-${p.subjectProcedureId}`;

      if (seen.has(key)) {
        throw new ConflictException(
          `Duplicate planned procedure for tooth number ${p.toothNumber} and subject procedure ID ${p.subjectProcedureId}`,
        );
      }

      seen.add(key);
    }
    try {
      return await this.dataSource.transaction(async (manager) => {
        const diagnosisSubmission = manager
          .getRepository(DiagnosisSubmission)
          .create({
            clinicalCase: clinicalCase,
            student: student,
            supervisor: clinicalCase.assignedSupervisor,
            clinical_impression: dto.clinicalImpression,
            status: DiagnosisSubmissionStatus.PENDING_REVIEW,
          });
        const savedSubmission = await manager.save(diagnosisSubmission);

        const plannedProcedures = dto.plannedProcedures.map((procedure) =>
          manager.getRepository(PlannedProcedures).create({
            diagnosisSubmission: savedSubmission,
            toothNumber: procedure.toothNumber,
            subjectProcedure: {
              id: procedure.subjectProcedureId,
            },
          }),
        );
        await manager.save(plannedProcedures);
        if (files?.length) {
          const images = files.map((file) =>
            manager.create(DiagnosisImages, {
              diagnosisSubmission: savedSubmission,
              file_path: file.path,
              file_name: file.originalname,
              mime_type: file.mimetype,
            }),
          );
          await manager.save(images);
        }
        clinicalCase.status = ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW;
        await manager.save(clinicalCase);

        return {
          message: 'Diagnosis submitted successfully for supervisor review.',
          data: {
            diagnosisSubmissionId: savedSubmission.id,
            clinicalCaseId: clinicalCase.id,
            status: clinicalCase.status,
            plannedProcedures: plannedProcedures.length,
            uploadedImages: files?.length ?? 0,
          },
        };
      });
    } catch (err) {
      await Promise.all(
        (files ?? []).map((file) => unlink(file.path).catch(() => {})),
      );

      throw err;
    }
  }
  async getDiagnosisSubmission(id: number) {
    const submission = await this.dataSource
      .getRepository(DiagnosisSubmission)
      .findOne({
        where: { id },
        relations: {
          clinicalCase: {
            assignedStudent: true,
            assignedSupervisor: true,
            subject: {
              subjectProcedures: true,
            },
          },
          student: true,
          supervisor: true,
          plannedProcedures: {
            subjectProcedure: true,
          },
          images: true,
        },
      });

    if (!submission) {
      throw new NotFoundException('Diagnosis submission not found');
    }

    return submission;
  }
}
