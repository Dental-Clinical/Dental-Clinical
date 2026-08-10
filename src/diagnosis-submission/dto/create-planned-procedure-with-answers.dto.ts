import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { CreatePlannedProcedureDto } from 'src/planned-procedures/dto/create-planned-procedure.dto';
import { CreateDiagnosisAnswerDto } from './create-diagnosis-answer.dto';

export class CreatePlannedProcedureWithAnswersDto extends CreatePlannedProcedureDto {
  @ApiProperty({
    description:
      'Answers to the subject diagnosis questions for this planned procedure',
    type: [CreateDiagnosisAnswerDto],
  })
  @ValidateNested({ each: true })
  @Type(() => CreateDiagnosisAnswerDto)
  @ArrayMinSize(1)
  answers: CreateDiagnosisAnswerDto[];
}
