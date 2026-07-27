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
import { AcademicYearsService } from './academic-years.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { GetAcademicYearsQueryDto } from './dto/get-academic-years-query.dto';
import {
  AcademicYearItemResponseDto,
  CreateAcademicYearResponseDto,
  DeleteAcademicYearResponseDto,
  GetAcademicYearsResponseDto,
  UpdateAcademicYearResponseDto,
} from './dto/academic-year-response.dto';

@ApiTags('Academic Years')
@ApiBearerAuth('JWT-auth')
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create an academic year' })
  @ApiBody({ type: CreateAcademicYearDto })
  @ApiCreatedResponse({
    type: CreateAcademicYearResponseDto,
    description: 'Academic year created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Academic year label already exists',
  })
  async createAcademicYear(@Body() dto: CreateAcademicYearDto) {
    return await this.academicYearsService.createAcademicYear(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of academic years' })
  @ApiOkResponse({
    type: GetAcademicYearsResponseDto,
    description: 'Academic years retrieved successfully',
  })
  async getAcademicYears(@Query() dto: GetAcademicYearsQueryDto) {
    return await this.academicYearsService.getAcademicYears(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get an academic year by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Academic year ID' })
  @ApiOkResponse({
    type: AcademicYearItemResponseDto,
    description: 'Academic year retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async getAcademicYearById(@Param('id', ParseIntPipe) id: number) {
    return await this.academicYearsService.getAcademicYearById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update an academic year' })
  @ApiParam({ name: 'id', type: Number, description: 'Academic year ID' })
  @ApiBody({ type: UpdateAcademicYearDto })
  @ApiOkResponse({
    type: UpdateAcademicYearResponseDto,
    description: 'Academic year updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Academic year label already exists',
  })
  async updateAcademicYear(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return await this.academicYearsService.updateAcademicYear(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete an academic year' })
  @ApiParam({ name: 'id', type: Number, description: 'Academic year ID' })
  @ApiOkResponse({
    type: DeleteAcademicYearResponseDto,
    description: 'Academic year deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  async deleteAcademicYear(@Param('id', ParseIntPipe) id: number) {
    return await this.academicYearsService.deleteAcademicYear(id);
  }
}
