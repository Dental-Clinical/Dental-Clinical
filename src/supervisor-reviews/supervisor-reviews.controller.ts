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
import { SupervisorReviewsService } from './supervisor-reviews.service';
import { ApproveReviewDto } from './dto/approve-review.dto';
import {
  ApproveReviewResponseDto,
  GetPendingReviewsResponseDto,
  SupervisorReviewDetailDataDto,
} from './dto/supervisor-review-response.dto';

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
}
