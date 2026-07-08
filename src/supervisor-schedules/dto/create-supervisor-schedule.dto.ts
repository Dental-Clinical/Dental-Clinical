import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from 'src/constants/day-of-week';

export class CreateSupervisorScheduleDto {
  @ApiProperty({
    enum: DayOfWeek,
    example: DayOfWeek.SUNDAY,
  })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  day_of_week: string;

  @ApiProperty({
    example: '08:00',
    description: '24-hour format (HH:mm)',
  })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:mm format',
  })
  start_time: string;

  @ApiProperty({
    example: '12:00',
    description: '24-hour format (HH:mm)',
  })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;

  @ApiProperty({
    example: 30,
    description: 'Slot duration in minutes',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(180)
  slot_duration: number;
}
