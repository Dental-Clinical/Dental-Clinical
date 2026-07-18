import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentAcademicYearsService } from './student-academic-years.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateStudentAcademicYearDto } from './dto/create-student-academic-year.dto';
import { UpdateStudentAcademicYearDto } from './dto/update-student-academic-year.dto';
import { GetStudentAcademicYearsQueryDto } from './dto/get-student-academic-years-query.dto';
import {
  CreateStudentAcademicYearResponseDto,
  DeleteStudentAcademicYearResponseDto,
  GetStudentAcademicYearsResponseDto,
  StudentAcademicYearItemResponseDto,
  UpdateStudentAcademicYearResponseDto,
} from './dto/student-academic-year-response.dto';

@ApiTags('Student Academic Years')
@ApiBearerAuth('JWT-auth')
@Controller('student-academic-years')
export class StudentAcademicYearsController {
  constructor(
    private readonly studentAcademicYearsService: StudentAcademicYearsService,
  ) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Enroll a student in an academic year' })
  @ApiBody({ type: CreateStudentAcademicYearDto })
  @ApiCreatedResponse({
    type: CreateStudentAcademicYearResponseDto,
    description: 'Student academic year created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Student, academic year, or study year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Student is already enrolled in this academic year',
  })
  async createStudentAcademicYear(@Body() dto: CreateStudentAcademicYearDto) {
    return await this.studentAcademicYearsService.createStudentAcademicYear(
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of student academic years' })
  @ApiOkResponse({
    type: GetStudentAcademicYearsResponseDto,
    description: 'Student academic years retrieved successfully',
  })
  async getStudentAcademicYears(@Query() dto: GetStudentAcademicYearsQueryDto) {
    return await this.studentAcademicYearsService.getStudentAcademicYears(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student academic year by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Student academic year ID',
  })
  @ApiOkResponse({
    type: StudentAcademicYearItemResponseDto,
    description: 'Student academic year retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student academic year not found' })
  async getStudentAcademicYearById(@Param('id', ParseIntPipe) id: number) {
    return await this.studentAcademicYearsService.getStudentAcademicYearById(
      id,
    );
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update a student academic year' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Student academic year ID',
  })
  @ApiBody({ type: UpdateStudentAcademicYearDto })
  @ApiOkResponse({
    type: UpdateStudentAcademicYearResponseDto,
    description: 'Student academic year updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Record, student, academic year, or study year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Student is already enrolled in this academic year',
  })
  async updateStudentAcademicYear(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentAcademicYearDto,
  ) {
    return await this.studentAcademicYearsService.updateStudentAcademicYear(
      id,
      dto,
    );
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete a student academic year' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Student academic year ID',
  })
  @ApiOkResponse({
    type: DeleteStudentAcademicYearResponseDto,
    description: 'Student academic year deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student academic year not found' })
  async deleteStudentAcademicYear(@Param('id', ParseIntPipe) id: number) {
    return await this.studentAcademicYearsService.deleteStudentAcademicYear(id);
  }
}
