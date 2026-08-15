import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from 'src/constants/day-of-week';

export class SupervisorScheduleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  supervisorId: number;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.SUNDAY })
  day_of_week: string;

  @ApiProperty({ example: '08:00' })
  start_time: string;

  @ApiProperty({ example: '12:00' })
  end_time: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at: Date;
}

export class WorkingDayResponseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'sunday' })
  day: string;

  @ApiProperty({ example: '08:00 - 12:00' })
  workingHours: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class WorkingDaysDataDto {
  @ApiProperty({ type: [WorkingDayResponseDto] })
  workingDays: WorkingDayResponseDto[];
}

export class CreateSupervisorScheduleResponseDto {
  @ApiProperty({ example: 'Supervisor schedule created successfully' })
  message: string;

  @ApiProperty({ type: SupervisorScheduleResponseDto })
  data: SupervisorScheduleResponseDto;
}

export class GetSupervisorScheduleResponseDto {
  @ApiProperty({ example: 'Supervisor schedules retrieved successfully' })
  message: string;

  @ApiProperty({ type: WorkingDaysDataDto })
  data: WorkingDaysDataDto;
}

export class UpdateSupervisorScheduleResponseDto {
  @ApiProperty({ example: 'Supervisor schedule updated successfully' })
  message: string;

  @ApiProperty({ type: SupervisorScheduleResponseDto })
  data: SupervisorScheduleResponseDto;
}

export class DeleteSupervisorScheduleResponseDto {
  @ApiProperty({ example: 'Supervisor schedule deleted successfully' })
  message: string;
}
