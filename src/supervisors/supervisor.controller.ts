import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupervisorService } from './supervisor.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { CreateSupervisorResponseDto } from './dto/create-supervisor-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { SupervisorCaseDetailsDto } from 'src/clinical-case/dto/supervisor-case-details.dto';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';

@ApiTags('Supervisors')
@ApiBearerAuth('JWT-auth')
@Controller('supervisors')
export class SupervisorController {
  constructor(
    private readonly supervisorService: SupervisorService,
    private readonly clinicalCaseService: ClinicalCaseService,
  ) {}

  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a new supervisor' })
  @ApiCreatedResponse({
    type: CreateSupervisorResponseDto,
    description: 'Supervisor created',
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  public async createSupervisor(
    @Body() createSupervisorDto: CreateSupervisorDto,
  ) {
    return await this.supervisorService.createSupervisor(createSupervisorDto);
  }
  @Get('my/clinical-cases')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Supervisor] Get all clinical cases assigned to the supervisor',
  })
  @ApiResponse({
    status: 200,
    description: 'List of clinical cases assigned to the supervisor',
  })
  public async getAssignedClinicalCases(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.supervisorService.getAssignedClinicalCases(user);
  }
  @Get('my/clinical-cases/:id')
  @ApiOperation({
    summary:
      '[Supervisor] Get a clinical case supervised by the current supervisor',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Clinical case ID' })
  @ApiOkResponse({
    type: SupervisorCaseDetailsDto,
    description: 'Details of a clinical case',
  })
  @ApiResponse({
    status: 403,
    description: 'Clinical Case is supervised by another supervisor',
  })
  @ApiResponse({ status: 404, description: 'Clinical Case not found' })
  @Roles([UserRole.SUPERVISOR])
  async getSupervisorClinicalCase(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.clinicalCaseService.findSupervisorCaseDetails(
      id,
      user.userId,
    );
  }
}
