import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
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

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

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
    summary: "[Student] Get the current student's subjects and study year",
  })
  @ApiResponse({
    status: 200,
    description: 'Subjects and study year retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or current enrollment not found',
  })
  public async getMySubjects(@CurrentUser() user: AuthenticatedUser) {
    return await this.studentService.getMySubjects(user.userId);
  }
}
