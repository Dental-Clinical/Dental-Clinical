import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Basic user info',
    example: { id: 1, full_name: 'John', role: 'patient' },
  })
  user: {
    id: number;
    full_name: string;
    role: string;
  };
}

export class StaffLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Basic user info',
    example: { id: 1, full_name: 'John', role: 'student' },
  })
  user: {
    id: number;
    full_name: string;
    role: string;
  };
}
