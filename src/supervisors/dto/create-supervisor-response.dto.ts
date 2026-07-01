import { ApiProperty } from '@nestjs/swagger';

export class CreateSupervisorResponseDto {
  @ApiProperty({
    description: 'ID of the created supervisor',
    example: 1,
  })
  supervisorId: number;
}
