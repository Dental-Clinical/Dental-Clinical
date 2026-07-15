import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Academic Years')
@ApiBearerAuth('JWT-auth')
@Controller('academic-years')
export class AcademicYearsController {}
