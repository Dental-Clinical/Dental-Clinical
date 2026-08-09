import {
  BadRequestException,
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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SubjectDiagnosisQuestion } from 'src/subject-diagnosis/subject-diagnosis-questions.entity';
import { SubjectDiagnosisAnswer } from 'src/subject-diagnosis/subject-diagnosis-answers.entity';
import { QuestionType } from 'src/subject-diagnosis/enums/question-types.enum';

@Injectable()
export class DiagnosisSubmissionService {
  constructor(
    private readonly studentService: StudentService,
    private readonly dataSource: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
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

    const questions = await this.dataSource
      .getRepository(SubjectDiagnosisQuestion)
      .find({
        where: { subject: { id: clinicalCase.subject.id }, isActive: true },
        relations: { answers: true, answerOptions: true },
      });
    const questionById = new Map(
      questions.map((question) => [question.id, question]),
    );

    const answeredQuestionIds = new Set<number>();

    for (const answer of dto.answers) {
      if (answeredQuestionIds.has(answer.questionId)) {
        throw new ConflictException(
          `Duplicate answer for question ID ${answer.questionId}`,
        );
      }
      answeredQuestionIds.add(answer.questionId);

      const question = questionById.get(answer.questionId);

      if (!question) {
        throw new ConflictException(
          `Question with ID ${answer.questionId} is not an active question for this subject`,
        );
      }
      console.log(question);

      // if (
      //   question.type === QuestionType.SINGLE_CHOICE ||
      //   question.type === QuestionType.MULTIPLE_CHOICE
      // ) {
      //   const optionValues = new Set(
      //     question.answerOptions.map((option) => option.value),
      //   );
      //   const values =
      //     question.type === QuestionType.SINGLE_CHOICE
      //       ? [answer.answer.trim()]
      //       : answer.answer.split(',').map((value) => value.trim());

      //   const seenValues = new Set<string>();

      //   for (const value of values) {
      //     if (!value || !optionValues.has(value)) {
      //       throw new BadRequestException(
      //         `Answer "${value}" is not a valid option for question ID ${answer.questionId}`,
      //       );
      //     }
      //     if (seenValues.has(value)) {
      //       throw new BadRequestException(
      //         `Duplicate answer value "${value}" for question ID ${answer.questionId}`,
      //       );
      //     }
      //     seenValues.add(value);
      //   }
      // }
      switch (question.type) {
        case QuestionType.TEXT:
        case QuestionType.TEXTAREA:
          if (!answer.answer?.trim()) {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} cannot be empty`,
            );
          }
          break;

        case QuestionType.NUMBER:
          if (
            answer.answer === undefined ||
            answer.answer.trim() === '' ||
            !Number.isFinite(Number(answer.answer))
          ) {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} must be a valid number.`,
            );
          }
          break;

        case QuestionType.BOOLEAN:
          if (answer.answer !== 'true' && answer.answer !== 'false') {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} must be true or false.`,
            );
          }
          break;

        case QuestionType.SINGLE_CHOICE:
          if (!answer.optionIds || answer.optionIds.length !== 1) {
            throw new BadRequestException(
              `Answer for question ID ${answer.questionId} must have exactly one option selected.`,
            );
          }

          const selectedOptionId = question.answerOptions.find(
            (option) => option.id === answer.optionIds![0],
          );
          if (!selectedOptionId) {
            throw new BadRequestException(
              `Invalid option for question ID ${answer.questionId}.`,
            );
          }
          break;

        case QuestionType.MULTIPLE_CHOICE: {
          if (!answer.optionIds || answer.optionIds.length === 0) {
            throw new BadRequestException(
              `Multiple-choice question ID ${answer.questionId} requires at least one option.`,
            );
          }

          const uniqueOptionIds = new Set(answer.optionIds);

          if (uniqueOptionIds.size !== answer.optionIds.length) {
            throw new BadRequestException(
              `Duplicate options are not allowed for question ID ${answer.questionId}.`,
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
                `Option ID ${optionId} is not valid for question ID ${answer.questionId}.`,
              );
            }
          }

          break;
        }
      }
    }

    for (const question of questions) {
      if (question.required && !answeredQuestionIds.has(question.id)) {
        throw new BadRequestException(
          `Required question "${question.question}" (ID ${question.id}) must be answered`,
        );
      }
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const diagnosisSubmission = manager
          .getRepository(DiagnosisSubmission)
          .create({
            clinicalCase: clinicalCase,
            student: student,
            supervisor: clinicalCase.assignedSupervisor,
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

        // const answers = dto.answers.map((answer) =>
        //   manager.getRepository(SubjectDiagnosisAnswers).create({
        //     diagnosisSubmission: savedSubmission,
        //     question: { id: answer.questionId },
        //     answer: answer.answer.trim(),
        //   }),
        // );
        // await manager.save(answers);
        const answerRepository = manager.getRepository(SubjectDiagnosisAnswer);

        const answers: SubjectDiagnosisAnswer[] = [];

        for (const dtoAnswer of dto.answers) {
          const diagnosisAnswer = answerRepository.create({
            diagnosisSubmission: savedSubmission,
            question: { id: dtoAnswer.questionId },
            answer: dtoAnswer.answer?.trim() ?? null,
            selectedOptions: dtoAnswer.optionIds
              ? questionById
                  .get(dtoAnswer.questionId)!
                  .answerOptions.filter((option) =>
                    dtoAnswer.optionIds!.includes(option.id),
                  )
              : [],
          });

          answers.push(diagnosisAnswer);
        }

        await answerRepository.save(answers);

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
          data: {
            diagnosisSubmissionId: savedSubmission.id,
            clinicalCaseId: clinicalCase.id,
            status: clinicalCase.status,
            answers: answers.length,
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
          answers: {
            question: true,
          },
        },
        order: {
          answers: {
            question: {
              displayOrder: 'ASC',
            },
          },
        },
      });

    if (!submission) {
      throw new NotFoundException('Diagnosis submission not found');
    }

    return submission;
  }
}
