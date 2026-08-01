import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateExaminationRequestDto {
  @ApiProperty({ description: 'Symptoms description', minLength: 5 })
  @IsString()
  @MinLength(5)
  symptoms: string;

  @ApiProperty({ description: 'Chief complaints' })
  @IsString()
  chiefComplaints: string;

  @ApiProperty({ description: 'Appointment date', example: '2025-12-25' })
  @Type(() => Date)
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({
    description: 'Appointment start time (HH:mm)',
    example: '09:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  appointmentStart: string;

  @ApiProperty({ description: 'Coordinator ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  coordinatorId: number;

  @ApiProperty({ description: 'Array of tooth numbers', example: [11, 12, 13] })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map(Number) : parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsArray()
  teeth: number[];

  /**
   * Placeholder for the multipart `attachments` part. Real files are consumed by
   * FileUploadInterceptor and injected via @UploadedFiles(); this exists only so a
   * client sending an empty or text-valued `attachments` field is not rejected by
   * the global ValidationPipe (forbidNonWhitelisted: true).
   */
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Attachments (images or PDF, max 5, up to 5MB each)',
  })
  @IsOptional()
  @Transform(() => undefined)
  attachments?: unknown;
}
