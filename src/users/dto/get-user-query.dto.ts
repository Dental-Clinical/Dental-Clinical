import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/constants/user-roles';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';

class GetUserBaseDto {
  @IsOptional()
  @IsString()
  @IsEnum(UserRole)
  role?: UserRole;
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;
}

export class GetUserQueryDto extends IntersectionType(
  GetUserBaseDto,
  PaginationDto,
) {}
