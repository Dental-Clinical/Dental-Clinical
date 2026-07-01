import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User role',
    example: 'patient',
  })
  role: string;
}

export class StaffLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User role',
    example: 'admin',
  })
  role: string;

  @ApiProperty({
    description: 'Basic user info',
    example: { id: 1, full_name: 'John', father_name: 'Doe' },
  })
  user: {
    id: number;
    full_name: string;
    father_name: string;
  };
}
