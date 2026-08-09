import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateStudentResponseDto } from './dto/create-student-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GetStudentsQueryDto } from './dto/get-students-query.dto';
import { PaginatedStudentsResponseDto } from './dto/student-response.dto';
import { GetSupervisorStudentsQueryDto } from './dto/get-supervisor-students-query.dto';
import { PaginatedSupervisorStudentsResponseDto } from './dto/supervisor-student-response.dto';
import { GetSupervisedStudentQueryDto } from './dto/get-supervised-student-query.dto';
import { SupervisedStudentDetailResponseDto } from './dto/supervised-student-detail-response.dto';

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get all students (paginated)' })
  @ApiOkResponse({
    type: PaginatedStudentsResponseDto,
    description: 'Paginated list of students',
  })
  async getAllStudents(@Query() query: GetStudentsQueryDto) {
    return await this.studentService.getAllStudents(query);
  }

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a new student' })
  @ApiCreatedResponse({
    type: CreateStudentResponseDto,
    description: 'Student created',
  })
  @ApiResponse({ status: 409, description: 'Student already exists' })
  public async createStudent(@Body() createStudentDto: CreateStudentDto) {
    return await this.studentService.createStudent(createStudentDto);
  }

  @Post('import')
  @Roles([UserRole.ADMIN])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '[Admin] Import students from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx)',
        },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Students imported successfully' })
  @ApiResponse({ status: 409, description: 'Student already exists' })
  async importStudents(@UploadedFile() file: Express.Multer.File) {
    return this.studentService.importStudents(file);
  }

  @Get('me/subjects')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: "[Student] Get the current student's subjects",
  })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
  })
  public async getMySubjects(@CurrentUser() user: AuthenticatedUser) {
    return await this.studentService.getMySubjects(user.userId);
  }

  @Get('supervised')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      '[Supervisor] Get the students this supervisor teaches, with per-subject procedure completion (paginated)',
  })
  @ApiOkResponse({
    type: PaginatedSupervisorStudentsResponseDto,
    description: 'Paginated list of supervised students',
  })
  public async getSupervisedStudents(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetSupervisorStudentsQueryDto,
  ) {
    return await this.studentService.getSupervisorStudents(user, query);
  }

  @Get('supervised/:id')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      "[Supervisor] Get one supervised student's procedure progress, by subject",
  })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiOkResponse({
    type: SupervisedStudentDetailResponseDto,
    description: 'The student and their progress in each subject taught',
  })
  @ApiResponse({
    status: 403,
    description: 'Student is supervised by another supervisor',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  public async getSupervisedStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetSupervisedStudentQueryDto,
  ) {
    return await this.studentService.getSupervisedStudentDetail(
      user,
      id,
      query,
    );
  }
}
