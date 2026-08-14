import { Module } from '@nestjs/common';
import { DentalAiController } from './dental-ai.controller';
import { DentalAiService } from './dental-ai.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [DentalAiService],
  controllers: [DentalAiController],
})
export class DentalAiModule {}
