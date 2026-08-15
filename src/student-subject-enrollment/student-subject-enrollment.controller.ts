import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { StudentSubjectEnrollmentService } from './student-subject-enrollment.service';
import { EnrollStudentInSubjectsDto } from './dto/enroll-student-in-subjects.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { ChangeStudentSectionDto } from './dto/change-student-section.dto';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  GetAllEnrollmentsResponseDto,
  GetEnrollmentByIdResponseDto,
} from './dto/get-all-enrollments-response.dto';

@Controller('student-subject-enrollment')
export class StudentSubjectEnrollmentController {
  constructor(
    private readonly studentSubjectEnrollmentService: StudentSubjectEnrollmentService,
  ) {}
  @Post()
  @Roles([UserRole.ADMIN])
  // @ApiBody({
  //   type: EnrollStudentInSubjectsDto,
  //   description: 'Enroll a student in subjects',
  // })
  // @ApiOperation({ summary: '[Admin] Enroll a student in subjects' })
  // @ApiOkResponse({
  //   description: 'Student enrolled in subjects successfully',
  // })
  async enrollStudentInSubjects(@Body() dto: EnrollStudentInSubjectsDto) {
    return await this.studentSubjectEnrollmentService.enrollStudentInSubjects(
      dto,
    );
  }
  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get all student subject enrollments' })
  @ApiOkResponse({
    type: GetAllEnrollmentsResponseDto,
    description: 'Student subject enrollments retrieved successfully',
  })
  async getAllEnrollments() {
    return await this.studentSubjectEnrollmentService.getAllEnrollments();
  }
  @Patch(':id/change-section')
  @Roles([UserRole.ADMIN])
  @ApiOperation({
    summary: '[Admin] Change student section for a subject enrollment',
  })
  @ApiBody({ type: ChangeStudentSectionDto })
  @ApiOkResponse({
    description: 'Student section changed successfully',
  })
  async changeStudentSection(
    @Param('id') id: number,
    @Body() dto: ChangeStudentSectionDto,
  ) {
    return await this.studentSubjectEnrollmentService.changeStudentSection(
      id,
      dto,
    );
  }
  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get a student subject enrollment by ID' })
  @ApiOkResponse({
    type: GetEnrollmentByIdResponseDto,
    description: 'Student subject enrollment retrieved successfully',
  })
  @Roles([UserRole.ADMIN])
  async getEnrollmentById(@Param('id') id: number) {
    return await this.studentSubjectEnrollmentService.getEnrollmentById(id);
  }
}
