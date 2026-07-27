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
import { StudentSectionService } from './student-section.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateStudentSectionDto } from './dto/create-student-section.dto';
import { UpdateStudentSectionDto } from './dto/update-student-section.dto';
import { GetStudentSectionsQueryDto } from './dto/get-student-sections-query.dto';
import {
  CreateStudentSectionResponseDto,
  DeleteStudentSectionResponseDto,
  GetStudentSectionsResponseDto,
  StudentSectionItemResponseDto,
  UpdateStudentSectionResponseDto,
} from './dto/student-section-response.dto';

@ApiTags('Student Sections')
@ApiBearerAuth('JWT-auth')
@Controller('student-sections')
export class StudentSectionController {
  constructor(private readonly studentSectionService: StudentSectionService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Assign a student to a clinic section' })
  @ApiBody({ type: CreateStudentSectionDto })
  @ApiCreatedResponse({
    type: CreateStudentSectionResponseDto,
    description: 'Student section created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Student academic year or clinic section not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Student is already assigned to this clinic section',
  })
  async createStudentSection(@Body() dto: CreateStudentSectionDto) {
    return await this.studentSectionService.createStudentSection(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of student sections' })
  @ApiOkResponse({
    type: GetStudentSectionsResponseDto,
    description: 'Student sections retrieved successfully',
  })
  async getStudentSections(@Query() dto: GetStudentSectionsQueryDto) {
    return await this.studentSectionService.getStudentSections(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a student section by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Student section ID' })
  @ApiOkResponse({
    type: StudentSectionItemResponseDto,
    description: 'Student section retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student section not found' })
  async getStudentSectionById(@Param('id', ParseIntPipe) id: number) {
    return await this.studentSectionService.getStudentSectionById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a student section' })
  @ApiParam({ name: 'id', type: Number, description: 'Student section ID' })
  @ApiBody({ type: UpdateStudentSectionDto })
  @ApiOkResponse({
    type: UpdateStudentSectionResponseDto,
    description: 'Student section updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description:
      'Student section, student academic year, or clinic section not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Student is already assigned to this clinic section',
  })
  async updateStudentSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentSectionDto,
  ) {
    return await this.studentSectionService.updateStudentSection(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a student section' })
  @ApiParam({ name: 'id', type: Number, description: 'Student section ID' })
  @ApiOkResponse({
    type: DeleteStudentSectionResponseDto,
    description: 'Student section deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student section not found' })
  async deleteStudentSection(@Param('id', ParseIntPipe) id: number) {
    return await this.studentSectionService.deleteStudentSection(id);
  }
}
