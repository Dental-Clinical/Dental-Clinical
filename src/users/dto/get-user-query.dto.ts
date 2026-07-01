import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/constants/user-roles';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetUserBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsString()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Search by name, email, or phone',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;
}

export class GetUserQueryDto extends IntersectionType(
  GetUserBaseDto,
  PaginationDto,
) {}
