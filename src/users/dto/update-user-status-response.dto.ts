import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusResponseDto {
  @ApiProperty({ example: 'User status updated successfully' })
  message: string;
}
