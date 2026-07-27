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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UserRole } from 'src/constants/user-roles';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { CreateTreatmentSessionDto } from './dto/create-treatment-sessions.dto';
import { CompleteTreatmentSessionDto } from './dto/complete-treatment-session.dto';
import {
  CompleteTreatmentSessionResponseDto,
  CreateTreatmentSessionResponseDto,
  GetTreatmentSessionProceduresResponseDto,
} from './dto/treatment-session-response.dto';

@ApiTags('Treatment Sessions')
@ApiBearerAuth('JWT-auth')
@Controller('treatment-sessions')
export class TreatmentSessionsController {
  constructor(
    private readonly treatmentSessionsService: TreatmentSessionsService,
  ) {}

  @Post()
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: '[Student] Create a new treatment session for a clinical case',
  })
  @ApiBody({ type: CreateTreatmentSessionDto })
  @ApiCreatedResponse({
    type: CreateTreatmentSessionResponseDto,
    description: 'Treatment session created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or clinical case not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Clinical case not assigned to student or already has an active session',
  })
  async createTreatmentSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTreatmentSessionDto,
  ) {
    return await this.treatmentSessionsService.createTreatmentSession(
      user.userId,
      dto,
    );
  }

  @Get(':treatmentSessionId/planned-procedures')
  @ApiOperation({
    summary: '[Student] Get planned procedures for a treatment session',
  })
  @ApiParam({
    name: 'treatmentSessionId',
    type: Number,
    description: 'Treatment session ID',
  })
  @ApiOkResponse({
    type: GetTreatmentSessionProceduresResponseDto,
    description: 'Treatment session procedures retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Treatment session not found' })
  @ApiResponse({
    status: 409,
    description: 'Session does not belong to student or is not active',
  })
  async getTreatmentSessionProcedures(
    @CurrentUser() user: AuthenticatedUser,
    @Param('treatmentSessionId', ParseIntPipe) treatmentSessionId: number,
  ) {
    return await this.treatmentSessionsService.getTreatmentSessionProcedures(
      user.userId,
      treatmentSessionId,
    );
  }

  @Post(':treatmentSessionId/complete')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: '[Student] Complete a treatment session with performed procedures',
  })
  @ApiParam({
    name: 'treatmentSessionId',
    type: Number,
    description: 'Treatment session ID',
  })
  @ApiBody({ type: CompleteTreatmentSessionDto })
  @ApiCreatedResponse({
    type: CompleteTreatmentSessionResponseDto,
    description: 'Treatment session completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student, treatment session, or procedure not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Session not active or duplicate procedures',
  })
  async completeTreatmentSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('treatmentSessionId', ParseIntPipe) treatmentSessionId: number,
    @Body() dto: CompleteTreatmentSessionDto,
  ) {
    return await this.treatmentSessionsService.completeTreatmentSession(
      user.userId,
      treatmentSessionId,
      dto,
    );
  }
}
