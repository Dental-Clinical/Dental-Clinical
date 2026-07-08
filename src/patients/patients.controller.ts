import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';
import { PatientsService } from './patients.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreatePatientWalkinDto } from './dto/create-walkin-patient.dto';
import {
  PatientResponseDto,
  PatientProfileResponseDto,
  UpdatePatientProfileResponseDto,
} from './dto/patient-response.dto';
import { UpdatePatientMedicalRecordsDto } from './dto/update-patient-medical-records.dto';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientService: PatientsService) {}

  @Post()
  @Roles([UserRole.STUDENT])
  @ApiOperation({ summary: 'Create a walk-in patient' })
  @ApiCreatedResponse({
    type: PatientResponseDto,
    description: 'Walk-in patient created',
  })
  async createWalkinPatient(@Body() dto: CreatePatientWalkinDto) {
    return await this.patientService.createPatient(dto);
  }

  @Get('me')
  @Roles([UserRole.PATIENT])
  @ApiOperation({ summary: 'Get my patient profile' })
  @ApiOkResponse({
    type: PatientProfileResponseDto,
    description: 'Patient profile',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return await this.patientService.getPatientProfile(user.userId);
  }

  @Patch('me')
  @Roles([UserRole.PATIENT])
  @ApiOperation({ summary: 'Update my patient profile' })
  @ApiOkResponse({
    type: UpdatePatientProfileResponseDto,
    description: 'Profile updated',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updatePatientProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return await this.patientService.updateMyProfile(user.userId, dto);
  }

  @Patch(':id/medical-records')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Update patient medical records' })
  @ApiOkResponse({
    description: 'Medical records updated',
  })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async updatePatientMedicalRecords(
    @Param('id') id: number,
    @Body() dto: UpdatePatientMedicalRecordsDto,
  ) {
    return await this.patientService.updateMedicalRecords(id, dto);
  }
}
