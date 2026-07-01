import { ApiProperty } from '@nestjs/swagger';

export class CreateCoordinatorResponseDto {
  @ApiProperty({
    description: 'ID of the created coordinator',
    example: 1,
  })
  coordinatorId: number;
}
