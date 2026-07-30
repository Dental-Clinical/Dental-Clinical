import { ApiProperty } from '@nestjs/swagger';

export class AvailableCoordinatorSlotDto {
  @ApiProperty({ example: 1 })
  coordinatorId: number;

  @ApiProperty({ example: 'Dr. Sarah Ahmed' })
  coordinatorName: string;

  @ApiProperty({ example: '2025-12-25' })
  appointmentDate: Date;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '09:30' })
  endTime: string;
}

export class GetAvailableSlotsResponseDto {
  @ApiProperty({ example: 'Available slots retrieved successfully' })
  message: string;

  @ApiProperty({ type: [AvailableCoordinatorSlotDto] })
  data: AvailableCoordinatorSlotDto[];
}
