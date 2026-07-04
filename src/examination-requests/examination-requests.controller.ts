import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExaminationRequestsService } from './examination-requests.service';
import { UserRole } from 'src/constants/user-roles';
import { CreateExaminationRequestDto } from './dto/create-request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/user.entity';
import { ExaminationAttachmentsInterceptor } from './interceptors/files.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApproveExaminationAppointmentDto } from './dto/create-appointment.dto';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Controller('examination-requests')
@UseGuards(JwtAuthGuard)
export class ExaminationRequestsController {
  constructor(private examinationRequestsService: ExaminationRequestsService) {}

  @Post()
  @Roles([UserRole.PATIENT])
  @UseInterceptors(ExaminationAttachmentsInterceptor())
  async createExaminationRequest(
    @Body() dto: CreateExaminationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.examinationRequestsService.createExaminationRequest(
      dto,
      user,
      files,
    );
  }

  @Get(':id')
  @Roles([UserRole.PATIENT, UserRole.COORDINATOR])
  async getExaminationRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.examinationRequestsService.getExaminationRequest(id, user);
  }

  // @Post(':id')
  // @Roles([UserRole.COORDINATOR])
  // async approveExaminationRequestAppointment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User, @Body() dto: ApproveExaminationAppointmentDto) {
  //   return this.examinationRequestsService.approveExaminationRequestAppointment(id, user, dto)
  // }

  @Get()
  @Roles([UserRole.PATIENT])
  async getAllExaminationRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.examinationRequestsService.getAllExaminationRequests(user);
  }
}
