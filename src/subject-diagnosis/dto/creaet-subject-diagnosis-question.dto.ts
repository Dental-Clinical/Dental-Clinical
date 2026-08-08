import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '../enums/question-types.enum';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

class QuestionOptions {
  @ApiProperty({
    description: 'The label of the option',
    example: 'Yes',
  })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    description: 'The value of the option',
    example: 'yes',
  })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({
    description: 'The order in which the option should be displayed',
    example: 1,
  })
  @IsInt()
  displayOrder: number;
}
export class CreateSubjectDiagnosisQuestionDto {
  @ApiProperty({
    description: 'The question text',
    example: 'Pain on percussion?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    enum: QuestionType,
    description: 'The type of the question',
    example: QuestionType.TEXT,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'Whether the question is required',
    example: true,
  })
  @IsBoolean()
  required: boolean;
  @ApiProperty({
    description: 'The order in which the question should be displayed',
    example: 1,
  })
  @IsInt()
  displayOrder: number;

  @ApiPropertyOptional({
    description: 'The options for the question (if applicable)',
    type: [QuestionOptions],
    required: false,
  })
  @IsOptional()
  options?: QuestionOptions[];
}
