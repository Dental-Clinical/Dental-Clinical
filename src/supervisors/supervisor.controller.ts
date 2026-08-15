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
  ApiBody,
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
import { SupervisorDashboardResponseDto } from './dto/supervisor-dashboard-response.dto';
import { SupervisorAssignedCasesResponseDto } from './dto/supervisor-clinical-cases-response.dto';
import { SupervisorDetailsResponseDto } from './dto/supervisor-details-response.dto';
import { ClinicalCaseService } from 'src/clinical-case/clinical-case.service';

@ApiTags('Supervisors')
@ApiBearerAuth('JWT-auth')
@Controller('supervisors')
export class SupervisorController {
  constructor(
    private readonly supervisorService: SupervisorService,
    private readonly clinicalCaseService: ClinicalCaseService,
  ) {}

  @Get()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Get all supervisors' })
  @ApiOkResponse({
    description: 'List of all supervisors',
    type: [SupervisorDetailsResponseDto],
  })
  public async getSupervisors() {
    return await this.supervisorService.getSupervisors();
  }
  @Post()
  @Roles([UserRole.ADMIN])
  @ApiOperation({ summary: '[Admin] Create a new supervisor' })
  @ApiBody({ type: CreateSupervisorDto })
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
  @Get('my/dashboard')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: "[Supervisor] Get the current supervisor's dashboard",
  })
  @ApiOkResponse({
    type: SupervisorDashboardResponseDto,
    description: 'Supervisor dashboard statistics',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  public async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return await this.supervisorService.getDashboard(user);
  }
  @Get('my/clinical-cases')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Supervisor] Get all clinical cases assigned to the supervisor',
  })
  @ApiOkResponse({
    type: SupervisorAssignedCasesResponseDto,
    description:
      'Clinical cases assigned to the supervisor, with their final evaluation if graded',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
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
  // Declared last on purpose: Nest matches routes in declaration order, so a
  // bare ':id' above the 'my/...' routes would swallow them.
  @Get(':id')
  @Roles([UserRole.ADMIN, UserRole.COORDINATOR])
  @ApiOperation({
    summary: "[Admin/Coordinator] Get a supervisor's contact details",
  })
  @ApiParam({ name: 'id', type: Number, description: 'Supervisor ID' })
  @ApiOkResponse({
    type: SupervisorDetailsResponseDto,
    description: 'Supervisor contact details',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  public async getSupervisorDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.supervisorService.getSupervisorDetails(id);
  }
}
