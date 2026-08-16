import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SubjectDiagnosisQuestion } from 'src/subject-diagnosis/subject-diagnosis-questions.entity';
import { SubjectDiagnosisAnswer } from 'src/subject-diagnosis/subject-diagnosis-answers.entity';
import { QuestionType } from 'src/subject-diagnosis/enums/question-types.enum';
import { CreatePlannedProcedureDto } from 'src/planned-procedures/dto/create-planned-procedure.dto';
import { CreatePlannedProcedureWithAnswersDto } from './dto/create-planned-procedure-with-answers.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { FCMChannels } from 'src/fcm-tokens/enums/notification-channels.enum';
import { DateTimeUtils } from 'src/utils/date-time.utils';

@Injectable()
export class DiagnosisSubmissionService {
  private readonly logger = new Logger(DiagnosisSubmissionService.name);

  constructor(
    private readonly studentService: StudentService,
    private readonly dataSource: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
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
          clinicalAppointments: true,
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
    const appointmentDateTime = DateTimeUtils.combine(
      clinicalCaseAppointment.appointmentDate,
      clinicalCaseAppointment.appointmentStart,
    );

    const now = new Date();

    if (now < appointmentDateTime) {
      throw new ConflictException(
        'Cannot submit diagnosis before the scheduled appointment time.',
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
      if (
        procedure.toothNumber &&
        clinicalCase.subject.requiresDentalChart === false
      ) {
        throw new ConflictException(
          `Procedure with ID ${procedure.subjectProcedureId} has a tooth number specified, but the subject does not require a dental chart`,
        );
      }
      if (
        !procedure.toothNumber &&
        clinicalCase.subject.requiresDentalChart === true
      ) {
        throw new ConflictException(
          `Procedure with ID ${procedure.subjectProcedureId} does not have a tooth number specified, but the subject requires a dental chart`,
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

    const questions = await this.dataSource
      .getRepository(SubjectDiagnosisQuestion)
      .find({
        where: { subject: { id: clinicalCase.subject.id }, isActive: true },
        relations: { answerOptions: true },
      });

    const questionById = new Map(
      questions.map((question) => [question.id, question]),
    );

    for (const procedure of dto.plannedProcedures) {
      DiagnosisSubmissionService.validateProcedureAnswers(
        procedure,
        questions,
        questionById,
      );
    }

    let submitted: { message: string };
    try {
      submitted = await this.dataSource.transaction(async (manager) => {
        const submissionRepository = manager.getRepository(DiagnosisSubmission);
        const procedureRepository = manager.getRepository(PlannedProcedures);
        const answerRepository = manager.getRepository(SubjectDiagnosisAnswer);

        const diagnosisSubmission = submissionRepository.create({
          clinicalCase,
          student,
          supervisor: clinicalCase.assignedSupervisor,
          status: DiagnosisSubmissionStatus.PENDING_REVIEW,
        });
        const savedSubmission =
          await submissionRepository.save(diagnosisSubmission);

        const savedProcedures: PlannedProcedures[] = [];
        const savedAnswers: SubjectDiagnosisAnswer[] = [];

        for (const procedure of dto.plannedProcedures) {
          const plannedProcedure = procedureRepository.create({
            diagnosisSubmission: savedSubmission,
            clinicalCase,
            subjectProcedure: { id: procedure.subjectProcedureId },
            toothNumber: procedure.toothNumber,
            notes: procedure.notes,
          });
          const savedProcedure =
            await procedureRepository.save(plannedProcedure);
          savedProcedures.push(savedProcedure);

          for (const answer of procedure.answers) {
            const subjectQuestion = questionById.get(answer.questionId);
            if (!subjectQuestion) {
              throw new ConflictException(
                `Question with ID ${answer.questionId} is not an active question for this subject`,
              );
            }
            const activeOptions = subjectQuestion.answerOptions.filter(
              (option) => option.isActive,
            );
            const requestedOptionIds = answer.optionIds ?? [];

            const selectedOptions = activeOptions.filter((option) =>
              requestedOptionIds.includes(option.id),
            );

            if (selectedOptions.length !== requestedOptionIds.length) {
              throw new BadRequestException(
                `One or more selected options are invalid for question ID ${subjectQuestion.id}`,
              );
            }
            const diagnosisAnswer = answerRepository.create({
              plannedProcedure: savedProcedure,
              question: { id: answer.questionId },
              answer: answer.answer?.trim() ?? null,
              selectedOptions,
            });
            const savedAnswer = await answerRepository.save(diagnosisAnswer);
            savedAnswers.push(savedAnswer);
          }
        }
        if (files?.length) {
          const uploadedImages = await this.cloudinaryService.uploadMany(
            files,
            'diagnosis-submissions',
          );
          const images = uploadedImages.map((image, index) =>
            manager.create(DiagnosisImages, {
              diagnosisSubmission: savedSubmission,
              publicId: image.public_id,
              fileUrl: image.secure_url,
              fileName: files[index].originalname,
              mimeType: files[index].mimetype,
            }),
          );
          await manager.save(images);
        }
        clinicalCase.status = ClinicalCaseStatus.DIAGNOSIS_PENDING_REVIEW;
        await manager.save(clinicalCase);

        clinicalCaseAppointment.status = ClinicalAppointmentStatus.COMPLETED;
        await manager.save(clinicalCaseAppointment);

        return {
          message: 'Diagnosis submitted successfully for supervisor review.',
        };
      });
    } catch (err) {
      await Promise.all(
        (files ?? []).map((file) => unlink(file.path).catch(() => {})),
      );

      throw err;
    }

    // The supervisor's pending-review queue is pull-only, so without this the
    // submission sits there until they happen to look. Sent after the commit,
    // and never allowed to fail the submission itself.
    try {
      await this.notificationsService.notifyUser(
        clinicalCase.assignedSupervisor.user.id,
        {
          title: 'Diagnosis awaiting review',
          body: `${student.user?.full_name ?? 'A student'} submitted a diagnosis for review.`,
          data: { clinicalCaseId: String(clinicalCase.id) },
        },
        NotificationType.DIAGNOSIS_SUBMITTED,
        FCMChannels.CASES,
      );
    } catch (error) {
      this.logger.error(
        `Failed to notify supervisor ${clinicalCase.assignedSupervisor.user.id} of a diagnosis submission on case ${clinicalCase.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return submitted;
  }
  public static validateProcedureAnswers(
    procedure: CreatePlannedProcedureWithAnswersDto,
    questions: SubjectDiagnosisQuestion[],
    questionById: Map<number, SubjectDiagnosisQuestion>,
  ) {
    const answeredQuestionIds = new Set<number>();

    for (const answer of procedure.answers) {
      if (answeredQuestionIds.has(answer.questionId)) {
        throw new ConflictException(
          `Duplicate answer for question ID ${answer.questionId} for procedure ${procedure.subjectProcedureId} on tooth ${procedure.toothNumber}`,
        );
      }

      answeredQuestionIds.add(answer.questionId);

      const question = questionById.get(answer.questionId);

      if (!question) {
        throw new ConflictException(
          `Question with ID ${answer.questionId} is not an active question for this subject`,
        );
      }

      switch (question.type) {
        case QuestionType.TEXT:
        case QuestionType.TEXTAREA:
          if (answer.optionIds?.length) {
            throw new BadRequestException(
              `Question ID ${answer.questionId} does not accept options`,
            );
          }

          if (!answer.answer?.trim()) {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} cannot be empty`,
            );
          }

          break;

        case QuestionType.NUMBER:
          if (answer.optionIds?.length) {
            throw new BadRequestException(
              `Question ID ${answer.questionId} does not accept options`,
            );
          }

          if (
            !answer.answer?.trim() ||
            !Number.isFinite(Number(answer.answer))
          ) {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} must be a valid number`,
            );
          }

          break;

        case QuestionType.BOOLEAN:
          if (answer.optionIds?.length) {
            throw new BadRequestException(
              `Question ID ${answer.questionId} does not accept options`,
            );
          }

          if (answer.answer !== 'true' && answer.answer !== 'false') {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} must be true or false`,
            );
          }

          break;

        case QuestionType.SINGLE_CHOICE: {
          if (!answer.optionIds || answer.optionIds.length !== 1) {
            throw new BadRequestException(
              `Question ID ${answer.questionId} requires exactly one option`,
            );
          }

          const validOptionIds = new Set(
            question.answerOptions
              .filter((option) => option.isActive)
              .map((option) => option.id),
          );

          if (!validOptionIds.has(answer.optionIds[0])) {
            throw new BadRequestException(
              `Invalid option for question ID ${answer.questionId}`,
            );
          }

          break;
        }

        case QuestionType.MULTIPLE_CHOICE: {
          if (!answer.optionIds?.length) {
            throw new BadRequestException(
              `Question ID ${answer.questionId} requires at least one option`,
            );
          }

          const uniqueOptionIds = new Set(answer.optionIds);

          if (uniqueOptionIds.size !== answer.optionIds.length) {
            throw new BadRequestException(
              `Duplicate options are not allowed for question ID ${answer.questionId}`,
            );
          }

          const validOptionIds = new Set(
            question.answerOptions
              .filter((option) => option.isActive)
              .map((option) => option.id),
          );

          for (const optionId of answer.optionIds) {
            if (!validOptionIds.has(optionId)) {
              throw new BadRequestException(
                `Option ID ${optionId} is not valid for question ID ${answer.questionId}`,
              );
            }
          }

          break;
        }
      }
    }

    // Required questions must be answered FOR THIS PROCEDURE
    for (const question of questions) {
      if (question.required && !answeredQuestionIds.has(question.id)) {
        throw new BadRequestException(
          `Required question "${question.question}" must be answered for procedure ${procedure.subjectProcedureId} on tooth ${procedure.toothNumber}`,
        );
      }
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
