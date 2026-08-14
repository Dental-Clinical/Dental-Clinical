import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import FormData from 'form-data';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as cloudinary from 'cloudinary';

@Injectable()
export class DentalAiService {
  constructor(private readonly httpService: HttpService) {}

  async analyzeImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const formData = new FormData();

    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    try {
      const response = await firstValueFrom(
        this.httpService.post(process.env.AI_SERVICE_URL!, formData, {
          headers: {
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      const result = await cloudinary.v2.uploader.upload(
        `data:image/jpeg;base64,${response.data.annotated_image}`,
        {
          folder: 'dental-ai/analyses',
          resource_type: 'image',
        },
      );
      return {
        findings: response.data.findings,
        imageUrl: result.secure_url,
      };
    } catch (error: any) {
      throw new HttpException(error.message, 400);
    }
  }
}
