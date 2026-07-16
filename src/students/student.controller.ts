import {
  Body,
  Controller,
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

@ApiTags('Students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a new student' })
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
  @ApiOperation({ summary: 'Import students from Excel file' })
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
}
