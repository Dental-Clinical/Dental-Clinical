import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Study Years')
@ApiBearerAuth('JWT-auth')
@Controller('study-years')
export class StudyYearsController {}
