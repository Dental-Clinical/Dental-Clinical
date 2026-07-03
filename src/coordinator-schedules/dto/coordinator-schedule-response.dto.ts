import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from 'src/constants/day-of-week';

export class CoordinatorScheduleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  coordinatorId: number;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.SUNDAY })
  day_of_week: string;

  @ApiProperty({ example: '08:00' })
  start_time: string;

  @ApiProperty({ example: '12:00' })
  end_time: string;

  @ApiProperty({ example: 30 })
  slot_duration: number;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updated_at: Date;
}

export class WorkingDayResponseDto {
  @ApiProperty({ example: 'sunday' })
  day: string;

  @ApiProperty({ example: '08:00 - 12:00' })
  workingHours: string;

  @ApiProperty({ example: 30 })
  slotDuration: number;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class WorkingDaysDataDto {
  @ApiProperty({ type: [WorkingDayResponseDto] })
  workingDays: WorkingDayResponseDto[];
}

export class CreateScheduleResponseDto {
  @ApiProperty({ example: 'Coordinator schedule created successfully' })
  message: string;

  @ApiProperty({ type: CoordinatorScheduleResponseDto })
  data: CoordinatorScheduleResponseDto;
}

export class GetScheduleResponseDto {
  @ApiProperty({ example: 'Coordinator schedules retrieved successfully' })
  message: string;

  @ApiProperty({ type: WorkingDaysDataDto })
  data: WorkingDaysDataDto;
}

export class UpdateScheduleResponseDto {
  @ApiProperty({ example: 'Coordinator schedule updated successfully' })
  message: string;

  @ApiProperty({ type: CoordinatorScheduleResponseDto })
  data: CoordinatorScheduleResponseDto;
}

export class DeleteScheduleResponseDto {
  @ApiProperty({ example: 'Coordinator schedule deleted successfully' })
  message: string;
}
