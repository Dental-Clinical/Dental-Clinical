import { IntersectionType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { NotificationType } from '../enums/notification-type.enum';

class GetNotificationsBaseDto {
  @ApiPropertyOptional({
    description: 'Filter by read state. Omit to return both.',
    example: false,
  })
  @IsOptional()
  // Read the raw query value off `obj` rather than `value`: the global
  // ValidationPipe runs with enableImplicitConversion, which has already
  // coerced 'false' to Boolean('false') === true by the time this sees it.
  // Anything unrecognised is passed through so @IsBoolean rejects it instead
  // of it being silently swallowed here.
  @Transform(({ obj }: { obj: Record<string, unknown> }): unknown => {
    const raw = obj.isRead;
    if (raw === 'true' || raw === true) return true;
    if (raw === 'false' || raw === false) return false;
    return raw;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by notification type',
    enum: NotificationType,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class GetNotificationsQueryDto extends IntersectionType(
  GetNotificationsBaseDto,
  PaginationDto,
) {}
