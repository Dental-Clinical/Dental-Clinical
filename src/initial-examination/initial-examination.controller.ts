import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InitialExaminationService } from './initial-examination.service';
import { CreateInitialExaminationDto } from './dto/create-initial-examination.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
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
import { UpdateInitialExaminationDto } from './dto/update-initial-examination.dto';
import { InitialExaminationResponseDto } from './dto/initial-examination-response.dto';
import { InitialExaminationSummaryDto } from './dto/initial-examination-summary.dto';

@ApiTags('Initial Examination')
@ApiBearerAuth('JWT-auth')
@Controller('initial-examination')
export class InitialExaminationController {
  constructor(private initialExaminationService: InitialExaminationService) {}

  @Post()
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Create an initial examination' })
  @ApiCreatedResponse({
    type: InitialExaminationResponseDto,
    description: 'Initial examination created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Examination Request, Appointment, or Coordinator not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'An Initial Examination already exists for this Examination Request',
  })
  async createInitialExamination(@Body() dto: CreateInitialExaminationDto) {
    return await this.initialExaminationService.createInitialExamination(dto);
  }

  @Get('student/:id')
  @Roles([UserRole.STUDENT])
  @ApiOperation({ summary: 'Get initial examination for a student' })
  @ApiParam({ name: 'id', type: Number, description: 'Student ID' })
  @ApiResponse({ status: 404, description: 'Initial examination not found' })
  async getInitialExaminationForStudent(@Param('id', ParseIntPipe) id: number) {
    // TODO
  }
  @Get(':id')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get an initial examination by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Initial examination ID' })
  @ApiOkResponse({
    type: InitialExaminationResponseDto,
    description: 'Initial examination details retrieved',
  })
  @ApiResponse({ status: 404, description: 'Initial examination not found' })
  async getInitialExamination(@Param('id', ParseIntPipe) id: number) {
    return await this.initialExaminationService.getInitialExamination(id);
  }

  @Patch(':id')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Update an initial examination' })
  @ApiParam({ name: 'id', type: Number, description: 'Initial examination ID' })
  @ApiBody({ type: UpdateInitialExaminationDto })
  @ApiOkResponse({
    description: 'Initial examination updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Initial examination not found' })
  async updateInitialExamination(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInitialExaminationDto,
  ) {
    return await this.initialExaminationService.updateInitialExamination(
      id,
      dto,
    );
  }

  @Get()
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get all initial examinations' })
  @ApiOkResponse({
    type: [InitialExaminationSummaryDto],
    description: 'List of initial examinations retrieved',
  })
  async getAllInitialExamination(): Promise<InitialExaminationSummaryDto[]> {
    return await this.initialExaminationService.getAllInitialExamination();
  }
}
