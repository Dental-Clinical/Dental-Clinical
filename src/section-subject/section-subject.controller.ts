import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { SectionSubjectService } from './section-subject.service';
import { UserRole } from 'src/constants/user-roles';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateSectionSubjectDto } from './dto/create-section-subject.dto';
import { UpdateSectionSubjectDto } from './dto/update-section-subject.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AssignmentResponseDto } from './dto/get-section-subject.dto';

@Controller('section-subject')
export class SectionSubjectController {
  constructor(private readonly sectionSubjectService: SectionSubjectService) {}

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of section subjects' })
  @ApiOkResponse({
    type: AssignmentResponseDto,
    description: 'Section subjects retrieved successfully',
  })
  async getSectionSubjects() {
    return await this.sectionSubjectService.getSectionSubjects();
  }
  @Post()
  @Roles([UserRole.ADMIN])
  async createSectionSubject(@Body() dto: CreateSectionSubjectDto) {
    return await this.sectionSubjectService.createSectionSubject(dto);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  async updateSectionSubject(
    @Body() dto: UpdateSectionSubjectDto,
    @Body('id') id: number,
  ) {
    return await this.sectionSubjectService.updateSectionSubject(id, dto);
  }
}
