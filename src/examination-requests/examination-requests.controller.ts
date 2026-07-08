import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExaminationRequestsService } from './examination-requests.service';
import { UserRole } from 'src/constants/user-roles';
import { CreateExaminationRequestDto } from './dto/create-request.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ExaminationAttachmentsInterceptor } from './interceptors/files.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@ApiTags('Examination Requests')
@ApiBearerAuth('JWT-auth')
@Controller('examination-requests')
@UseGuards(JwtAuthGuard)
export class ExaminationRequestsController {
  constructor(private examinationRequestsService: ExaminationRequestsService) { }

  @Post()
  @Roles([UserRole.PATIENT])
  @UseInterceptors(ExaminationAttachmentsInterceptor())
  @ApiOperation({ summary: 'Create an examination request with attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symptoms: { type: 'string', description: 'Symptoms description', minLength: 5 },
        chiefComplaints: { type: 'string', description: 'Chief complaints' },
        appointmentDate: { type: 'string', format: 'date', description: 'Appointment date' },
        appointmentStart: { type: 'string', example: '09:00', description: 'Appointment start time (HH:mm)' },
        coordinatorId: { type: 'number', description: 'Coordinator ID' },
        teeth: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of tooth numbers',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Attachments (images or PDF, max 5, up to 5MB each)',
        },
      },
      required: ['symptoms', 'chiefComplaints', 'appointmentDate', 'appointmentStart', 'coordinatorId', 'teeth'],
    },
  })
  @ApiCreatedResponse({ description: 'Examination request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate tooth numbers' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'You already have a pending examination request' })
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

  @Get()
  @Roles([UserRole.PATIENT, UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get all examination requests for the current patient' })
  @ApiOkResponse({ description: 'List of examination requests retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getAllExaminationRequestsForAUser(@CurrentUser() user: AuthenticatedUser) {
    return this.examinationRequestsService.getAllExaminationRequestsForAUser(user);
  }

  @Get('/all')
  @Roles([UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get all examination requests' })
  @ApiOkResponse({ description: 'List of examination requests retrieved' })
  async getAllExaminationRequests() {
    return this.examinationRequestsService.getAllExaminationRequests();
  }





  @Get(':id')
  @Roles([UserRole.PATIENT, UserRole.COORDINATOR])
  @ApiOperation({ summary: 'Get examination request by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Examination request ID' })
  @ApiOkResponse({ description: 'Examination request details retrieved' })
  @ApiResponse({ status: 404, description: 'Examination request not found' })
  async getExaminationRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.examinationRequestsService.getExaminationRequest(id, user);
  }


}
