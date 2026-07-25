import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UserRole } from 'src/constants/user-roles';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { CreateTreatmentSessionDto } from './dto/create-treatment-sessions.dto';
import { PerformedProceduresDto } from './dto/performed-procedures.dto';
import { CreateSessionProcedureDto } from './dto/create-session-procedure.dto';
import { CompleteTreatmentSessionDto } from './dto/complete-treatment-session.dto';

@Controller('treatment-sessions')
export class TreatmentSessionsController {
  constructor(
    private readonly treatmentSessionsService: TreatmentSessionsService,
  ) {}
  @Post()
  @Roles([UserRole.STUDENT])
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
