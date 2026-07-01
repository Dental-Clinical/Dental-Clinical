import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { PatientsService } from './patients.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreatePatientWalkinDto } from './dto/create-walkin-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientService: PatientsService) {}
  @Post()
  @Roles([UserRole.STUDENT])
  async createWalkinPatient(@Body() dto: CreatePatientWalkinDto) {
    return await this.patientService.createPatient(dto);
  }
  @Get('me')
  @Roles([UserRole.PATIENT])
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return await this.patientService.getPatientProfile(user.userId);
  }
  @Patch('me')
  @Roles([UserRole.PATIENT])
  async updatePatientProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return await this.patientService.updateMyProfile(user.userId, dto);
  }
}
