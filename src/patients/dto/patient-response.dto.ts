import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Jane Doe' })
  full_name: string;

  @ApiProperty({ example: '963912345678' })
  phone: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'female' })
  gender?: string;

  @ApiProperty({ example: false })
  is_walkin: boolean;

  @ApiPropertyOptional({ example: 'Diabetes' })
  medical_history?: string;

  @ApiPropertyOptional({ example: 'Metformin' })
  current_medications?: string;

  @ApiPropertyOptional({ example: 'Penicillin' })
  allergies?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;
}

export class PatientProfileResponseDto {
  @ApiProperty({ example: 'Patient profile retrieved successfully' })
  message: string;

  @ApiProperty({ type: PatientResponseDto })
  patient: PatientResponseDto;
}

export class UpdatePatientProfileResponseDto {
  @ApiProperty({ example: 'Profile updated successfully' })
  message: string;

  @ApiProperty({ type: PatientResponseDto })
  patient: PatientResponseDto;
}
