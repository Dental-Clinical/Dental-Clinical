import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupervisorDetailsResponseDto {
  @ApiProperty({
    description: 'Supervisor ID',
    example: 3,
  })
  id: number;

  @ApiProperty({
    description: 'Full name',
    example: 'Dr. Sarah Malek',
  })
  full_name: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Email address',
    example: 'sarah@example.com',
  })
  email: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Phone number',
    example: '+963912345678',
  })
  phone: string | null;
}
