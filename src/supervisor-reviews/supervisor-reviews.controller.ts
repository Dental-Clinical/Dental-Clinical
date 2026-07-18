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
import { SupervisorReviewsService } from './supervisor-reviews.service';
import { ApproveReviewDto } from './dto/approve-review.dto';

@Controller('supervisor/reviews')
export class SupervisorReviewsController {
  constructor(
    private readonly supervisorReviewService: SupervisorReviewsService,
  ) {}
  @Get()
  @Roles([UserRole.SUPERVISOR])
  public async getPendingReviews(@CurrentUser() user: AuthenticatedUser) {
    return await this.supervisorReviewService.getPendingReviews(user);
  }
  @Get('/:id')
  @Roles([UserRole.SUPERVISOR])
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
