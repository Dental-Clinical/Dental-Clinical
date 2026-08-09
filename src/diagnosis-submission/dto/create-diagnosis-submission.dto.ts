import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreatePlannedProcedureDto } from 'src/planned-procedures/dto/create-planned-procedure.dto';
import { CreateDiagnosisAnswerDto } from './create-diagnosis-answer.dto';

export class CreateDiagnosisSubmissionDto {
  @IsInt()
  @Min(1)
  clinicalCaseId: number;

  @ValidateNested({ each: true })
  @Type(() => CreateDiagnosisAnswerDto)
  @ArrayMinSize(1)
  answers: CreateDiagnosisAnswerDto[];

  @ValidateNested({ each: true })
  @Type(() => CreatePlannedProcedureDto)
  @ArrayMinSize(1)
  plannedProcedures: CreatePlannedProcedureDto[];

  /**
   * Placeholder for the multipart `images` part. Real files are consumed by
   * FileUploadInterceptor and injected via @UploadedFiles(); this exists only so a
   * client sending an empty or text-valued `images` field is not rejected by the
   * global ValidationPipe (forbidNonWhitelisted: true).
   */
  @IsOptional()
  @Transform(() => undefined)
  images?: unknown;
}
