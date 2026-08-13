import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result!);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
  // async uploadMany(
  //   files: Express.Multer.File[],
  //   folder: string,
  // ): Promise<UploadApiResponse[]> {
  //   const uploadPromises = files.map((file) => this.uploadImage(file, folder));
  //   return Promise.all(uploadPromises);
  // }
  async uploadMany(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<UploadApiResponse[]> {
    const results = await Promise.allSettled(
      files.map((file) => this.uploadImage(file, folder)),
    );

    const successful = results
      .filter(
        (result): result is PromiseFulfilledResult<UploadApiResponse> =>
          result.status === 'fulfilled',
      )
      .map((result) => result.value);

    const failed = results.find((result) => result.status === 'rejected');

    if (failed) {
      await Promise.all(
        successful.map((image) => this.delete(image.public_id).catch(() => {})),
      );

      throw failed.reason;
    }

    return successful;
  }

  async delete(publicId: string): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
  }

  async testConnection(): Promise<string> {
    return cloudinary.api.ping();
  }
}
