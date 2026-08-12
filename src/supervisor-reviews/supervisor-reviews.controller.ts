import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { SupervisorReviewsService } from './supervisor-reviews.service';
import { ApproveReviewDto } from './dto/approve-review.dto';
import {
  ApproveReviewResponseDto,
  ChangeClinicalCaseSubjectResponseDto,
  GetPendingReviewsResponseDto,
  SupervisorReviewDetailDataDto,
} from './dto/supervisor-review-response.dto';
import { ChangeClinicalCaseSubjectDto } from './dto/change-clinical-case-subject.dto';

@ApiTags('Supervisor Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('supervisor/reviews')
export class SupervisorReviewsController {
  constructor(
    private readonly supervisorReviewService: SupervisorReviewsService,
  ) {}

  @Get()
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      '[Supervisor] Get all pending diagnosis reviews for the supervisor',
  })
  @ApiOkResponse({
    type: GetPendingReviewsResponseDto,
    description: 'Pending reviews retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  public async getPendingReviews(@CurrentUser() user: AuthenticatedUser) {
    return await this.supervisorReviewService.getPendingReviews(user);
  }

  @Get('/:id')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary: '[Supervisor] Get detailed view of a pending diagnosis review',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Diagnosis submission ID',
  })
  @ApiOkResponse({
    type: SupervisorReviewDetailDataDto,
    description: 'Review details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  public async getPendingReviewDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) submissionId: number,
  ) {
    return await this.supervisorReviewService.getPendingReviewDetails(
      user,
      submissionId,
    );
  }

  @Post('/:id/approve')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({ summary: '[Supervisor] Approve a diagnosis submission' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Diagnosis submission ID',
  })
  @ApiBody({ type: ApproveReviewDto })
  @ApiCreatedResponse({
    type: ApproveReviewResponseDto,
    description: 'Diagnosis approved successfully',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({
    status: 409,
    description: 'Submission already reviewed or not pending review',
  })
  public async approveReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) submissionId: number,
    @Body() dto: ApproveReviewDto,
  ) {
    return await this.supervisorReviewService.approveReview(
      user,
      submissionId,
      dto,
    );
  }

  @Patch('/clinical-cases/:id/subject')
  @Roles([UserRole.SUPERVISOR])
  @ApiOperation({
    summary:
      '[Supervisor] Reassign an open clinical case to a different subject',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Clinical case ID',
  })
  @ApiBody({ type: ChangeClinicalCaseSubjectDto })
  @ApiOkResponse({
    type: ChangeClinicalCaseSubjectResponseDto,
    description: 'Clinical case reassigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Clinical case or subject not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Case is not open, same subject, or subject is inactive',
  })
  public async changeClinicalCaseSubject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeClinicalCaseSubjectDto,
  ) {
    return await this.supervisorReviewService.changeClinicalCaseSubject(
      user,
      id,
      dto,
    );
  }
  // TODO add reject review endpoint here in the future if needed
}
