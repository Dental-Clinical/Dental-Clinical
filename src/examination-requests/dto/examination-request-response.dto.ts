import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExaminationRequestAttachmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../image.jpg' })
  file_url: string;

  @ApiProperty({ example: 'xray.jpg' })
  file_name: string;

  @ApiProperty({ example: 'image/jpeg' })
  mime_type: string;
}

export class ExaminationRequestToothDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 36 })
  tooth: number;
}
class ExaminationRequestAppointmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-01-01' })
  appointmentDate: Date;
}

export class ExaminationRequestDataDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  patient_id: number;

  @ApiProperty({ example: 'Severe pain when eating hot food' })
  symptoms: string;

  @ApiPropertyOptional({ example: 'Toothache on upper left' })
  chief_complaint: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'under_review', 'accepted', 'rejected'],
  })
  status: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  submitted_at: Date;

  @ApiPropertyOptional({ type: [ExaminationRequestToothDto] })
  teeth?: ExaminationRequestToothDto[];

  @ApiPropertyOptional({ type: [ExaminationRequestAttachmentDto] })
  attachments?: ExaminationRequestAttachmentDto[];

  @ApiPropertyOptional({ type: ExaminationRequestAppointmentDto })
  appointment?: ExaminationRequestAppointmentDto;
}

export class CreateExaminationRequestResponseDto {
  @ApiProperty({ example: 'Examination request created successfully' })
  message: string;

  @ApiProperty({ type: ExaminationRequestDataDto })
  data: ExaminationRequestDataDto;
}

export class GetAllExaminationRequestsResponseDto {
  @ApiProperty({ example: 'Examination requests retrieved successfully' })
  message: string;

  @ApiProperty({ type: [ExaminationRequestDataDto] })
  data: ExaminationRequestDataDto[];
}

export class GetExaminationRequestResponseDto {
  @ApiProperty({ example: 'Examination request retrieved successfully' })
  message: string;

  @ApiProperty({ type: ExaminationRequestDataDto })
  data: ExaminationRequestDataDto;
}
