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
import { ClinicSectionsService } from './clinic-sections.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateClinicSectionDto } from './dto/create-clinic-section.dto';
import { UpdateClinicSectionDto } from './dto/update-clinic-section.dto';
import { GetClinicSectionsQueryDto } from './dto/get-clinic-sections-query.dto';
import {
  ClinicSectionItemResponseDto,
  CreateClinicSectionResponseDto,
  DeleteClinicSectionResponseDto,
  GetClinicSectionsResponseDto,
  UpdateClinicSectionResponseDto,
} from './dto/clinic-section-response.dto';

@ApiTags('Clinic Sections')
@ApiBearerAuth('JWT-auth')
@Controller('clinic-sections')
export class ClinicSectionsController {
  constructor(private readonly clinicSectionsService: ClinicSectionsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a clinic section' })
  @ApiBody({ type: CreateClinicSectionDto })
  @ApiCreatedResponse({
    type: CreateClinicSectionResponseDto,
    description: 'Clinic section created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Subject or supervisor not found' })
  @ApiResponse({
    status: 409,
    description: 'Section name already exists for this subject',
  })
  async createClinicSection(@Body() dto: CreateClinicSectionDto) {
    return await this.clinicSectionsService.createClinicSection(dto);
  }

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a paginated list of clinic sections' })
  @ApiOkResponse({
    type: GetClinicSectionsResponseDto,
    description: 'Clinic sections retrieved successfully',
  })
  async getClinicSections(@Query() dto: GetClinicSectionsQueryDto) {
    return await this.clinicSectionsService.getClinicSections(dto);
  }

  @Get(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get a clinic section by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic section ID' })
  @ApiOkResponse({
    type: ClinicSectionItemResponseDto,
    description: 'Clinic section retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Clinic section not found' })
  async getClinicSectionById(@Param('id', ParseIntPipe) id: number) {
    return await this.clinicSectionsService.getClinicSectionById(id);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Update a clinic section' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic section ID' })
  @ApiBody({ type: UpdateClinicSectionDto })
  @ApiOkResponse({
    type: UpdateClinicSectionResponseDto,
    description: 'Clinic section updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 404,
    description: 'Clinic section, subject, or supervisor not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Section name already exists for this subject',
  })
  async updateClinicSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClinicSectionDto,
  ) {
    return await this.clinicSectionsService.updateClinicSection(id, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Delete a clinic section' })
  @ApiParam({ name: 'id', type: Number, description: 'Clinic section ID' })
  @ApiOkResponse({
    type: DeleteClinicSectionResponseDto,
    description: 'Clinic section deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Clinic section not found' })
  async deleteClinicSection(@Param('id', ParseIntPipe) id: number) {
    return await this.clinicSectionsService.deleteClinicSection(id);
  }
}
