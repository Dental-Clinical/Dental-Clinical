import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateDiagnosisAnswerDto {
  @IsInt()
  @Min(1)
  questionId: number;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
