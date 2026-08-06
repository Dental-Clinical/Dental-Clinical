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
import { ClinicService } from './clinic.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { GetClinicsQueryDto } from './dto/get-clinics-query.dto';
import {
  ClinicItemResponseDto,
  CreateClinicResponseDto,
  DeleteClinicResponseDto,
  GetClinicsResponseDto,
  UpdateClinicResponseDto,
} from './dto/clinic-response.dto';

@ApiTags('Clinics')
@ApiBearerAuth('JWT-auth')
@Controller('clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a clinic' })
  @ApiBody({ type: CreateClinicDto })
  @ApiCreatedResponse({
    type: CreateClinicResponseDto,
    description: 'Clinic created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Academic year not found' })
  @ApiResponse({
    status: 409,
    description: 'Clinic name already exists for this academic year',
  })
  async createClinic(@Body() dto: CreateClinicDto) {
    return await this.clinicService.createClinic(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of clinics' })
  @ApiOkResponse({
    type: GetClinicsResponseDto,
    description: 'Clinics retrieved successfully',
  })
  async getClinics(@Query() dto: GetClinicsQueryDto) {
    return await this.clinicService.getClinics(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a clinic by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic ID' })
  @ApiOkResponse({
    type: ClinicItemResponseDto,
    description: 'Clinic retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getClinicById(@Param('id', ParseIntPipe) id: number) {
    return await this.clinicService.getClinicById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a clinic' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic ID' })
  @ApiBody({ type: UpdateClinicDto })
  @ApiOkResponse({
    type: UpdateClinicResponseDto,
    description: 'Clinic updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Clinic or academic year not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Clinic name already exists for this academic year',
  })
  async updateClinic(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClinicDto,
  ) {
    return await this.clinicService.updateClinic(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a clinic' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic ID' })
  @ApiOkResponse({
    type: DeleteClinicResponseDto,
    description: 'Clinic deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  @ApiResponse({
    status: 409,
    description: 'Clinic still has subjects or sections',
  })
  async deleteClinic(@Param('id', ParseIntPipe) id: number) {
    return await this.clinicService.deleteClinic(id);
  }
}
