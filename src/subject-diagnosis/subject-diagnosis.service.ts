import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubjectDiagnosisQuestion } from './subject-diagnosis-questions.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSubjectDiagnosisQuestionDto } from './dto/creaet-subject-diagnosis-question.dto';
import { Subject } from 'src/subjects/subjects.entity';
import { QuestionType } from './enums/question-types.enum';
import { SubjectDiagnosisQuestionOption } from './subject-diagnosis-answer-option.entity';

@Injectable()
export class SubjectDiagnosisService {
  constructor(
    @InjectRepository(SubjectDiagnosisQuestion)
    private readonly subjectDiagnosisQuestionRepository: Repository<SubjectDiagnosisQuestion>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly dataSource: DataSource,
  ) {}
  async createDiagnosisQuestions(
    dto: CreateSubjectDiagnosisQuestionDto,
    subjectId: number,
  ) {
    const subjectExists = await this.subjectRepository.findOne({
      where: {
        id: subjectId,
      },
    });
    if (!subjectExists) {
      throw new ConflictException(
        'The subject with the provided ID does not exist.',
      );
    }
    const existingQuestion =
      await this.subjectDiagnosisQuestionRepository.findOne({
        where: {
          question: dto.question,
          subject: { id: subjectExists.id },
        },
      });
    if (existingQuestion) {
      throw new ConflictException(
        'A question with the same text already exists for this subject.',
      );
    }
    const isChoiceQuestion =
      dto.type === QuestionType.SINGLE_CHOICE ||
      dto.type === QuestionType.MULTIPLE_CHOICE;

    if (isChoiceQuestion && (!dto.options || dto.options.length === 0)) {
      throw new BadRequestException(
        'Choice questions must have at least one option.',
      );
    }

    if (!isChoiceQuestion && dto.options?.length) {
      throw new BadRequestException(
        'Options can only be provided for choice questions.',
      );
    }

    const optionValues = dto.options?.map((o) => o.value) ?? [];

    if (new Set(optionValues).size !== optionValues.length) {
      throw new ConflictException('Duplicate option values are not allowed.');
    }

    if (dto.options) {
      const optionValues = dto.options.map((option) => option.value);
      const uniqueOptionValues = new Set(optionValues);
      if (optionValues.length !== uniqueOptionValues.size) {
        throw new ConflictException(
          'Duplicate option values are not allowed for multiple choice questions.',
        );
      }
    }
    const orders = dto.options?.map((o) => o.displayOrder) ?? [];

    if (new Set(orders).size !== orders.length) {
      throw new ConflictException(
        'Duplicate option display orders are not allowed.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const questionRepository = manager.getRepository(
        SubjectDiagnosisQuestion,
      );

      const optionRepository = manager.getRepository(
        SubjectDiagnosisQuestionOption,
      );

      const question = questionRepository.create({
        subject: subjectExists,
        type: dto.type,
        question: dto.question,
        required: dto.required,
        displayOrder: dto.displayOrder,
      });

      const savedQuestion = await questionRepository.save(question);

      if (isChoiceQuestion) {
        const options = dto.options!.map((option) =>
          optionRepository.create({
            question: savedQuestion,
            label: option.label,
            value: option.value,
            displayOrder: option.displayOrder,
          }),
        );

        await optionRepository.save(options);
      }

      return {
        message: 'Diagnosis question created successfully',
        questionId: savedQuestion.id,
      };
    });
  }
  async getDiagnosisQuestionsBySubjectId(subjectId: number) {
    const subjectExists = await this.subjectRepository.findOne({
      where: {
        id: subjectId,
      },
      relations: { subjectProcedures: true },
    });
    if (!subjectExists) {
      throw new ConflictException(
        'The subject with the provided ID does not exist.',
      );
    }
    const requiredProcedures = subjectExists.subjectProcedures;
    const questions = await this.subjectDiagnosisQuestionRepository.find({
      where: {
        subject: { id: subjectExists.id },
        isActive: true,
      },
      relations: {
        answerOptions: true,
      },
      order: {
        displayOrder: 'ASC',
      },
    });
    return {
      subjectId,
      subjectName: subjectExists.name,
      requiresDentalChart: true,
      availableProcedures: requiredProcedures.map((procedure) => ({
        id: procedure.id,
        name: procedure.name,
      })),
      questions: questions.map((question) => ({
        id: question.id,
        question: question.question,
        type: question.type,
        required: question.required,
        displayOrder: question.displayOrder,
        options: question.answerOptions.map((answer) => ({
          id: answer.id,
          label: answer.label,
          value: answer.value,
          displayOrder: answer.displayOrder,
        })),
      })),
    };
  }
}
