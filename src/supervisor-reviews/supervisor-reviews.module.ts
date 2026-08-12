import { Module } from '@nestjs/common';
import { SupervisorReviewsService } from './supervisor-reviews.service';
import { SupervisorReviewsController } from './supervisor-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupervisorReview } from './supervisor-reviews.entity';
import { SupervisorModule } from 'src/supervisors/supervisor.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupervisorReview]),
    SupervisorModule,
    CloudinaryModule,
  ],
  providers: [SupervisorReviewsService],
  controllers: [SupervisorReviewsController],
})
export class SupervisorReviewsModule {}
