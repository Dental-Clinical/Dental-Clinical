import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StudyYearsService } from './study-years.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';

@ApiTags('Study Years')
@ApiBearerAuth('JWT-auth')
@Controller('study-years')
export class StudyYearsController {
  constructor(private readonly studyYearsService: StudyYearsService) {}
  @Get()
  @Roles([UserRole.ADMIN, UserRole.COORDINATOR])
  async getStudyYears() {
    return await this.studyYearsService.getStudyYears();
  }
}
