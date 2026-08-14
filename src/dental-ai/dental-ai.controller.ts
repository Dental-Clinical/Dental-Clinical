import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DentalAiService } from './dental-ai.service';
import { FileUploadInterceptor } from 'src/common/interceptors/files.interceptor';
import { AllowAnonymous } from 'src/auth/decorators/allow-anonymous.decorator';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/constants/user-roles';

@ApiTags('Dental AI')
@Controller('ai')
export class DentalAiController {
  constructor(private readonly dentalAiService: DentalAiService) {}

  @Post('analyze')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary: 'Analyze a dental X-ray',
    description:
      'Uploads a dental X-ray image and uses the AI model to detect dental findings and generate an annotated X-ray image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Dental X-ray image to analyze.',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Dental X-ray analyzed successfully.',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        message: 'Success',
        data: {
          findings: [
            {
              condition: 'impacted tooth',
              confidence: 0.81,
              region: 'lower right molar',
              color: 'green',
            },
            {
              condition: 'Crown',
              confidence: 0.65,
              region: 'lower left molar',
              color: 'white',
            },
            {
              condition: 'Filling',
              confidence: 0.55,
              region: 'lower left molar',
              color: 'blue',
            },
          ],
          imageUrl:
            'https://res.cloudinary.com/hciqx9xb/image/upload/v1786700199/dental-ai/analyses/mm7vijfkyaxykwojknsu.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or missing image file.',
  })
  @ApiResponse({
    status: 500,
    description: 'AI analysis failed.',
  })
  @UseInterceptors(FileUploadInterceptor({ fieldName: 'file', maxCount: 1 }))
  async analyzeImage(@UploadedFiles() file: Express.Multer.File[]) {
    return this.dentalAiService.analyzeImage(file[0]);
  }
}
