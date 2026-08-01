import {
  BadRequestException,
  Injectable,
  NestInterceptor,
  Type,
  mixin,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export interface UploadOptions {
  fieldName?: string;
  maxCount?: number;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
}

export function FileUploadInterceptor(
  options: UploadOptions,
): Type<NestInterceptor> {
  const {
    fieldName = 'files',
    maxCount = 5,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize = 5 * 1024 * 1024,
  } = options;

  @Injectable()
  class MixinInterceptor extends FilesInterceptor(fieldName, maxCount, {
    storage: memoryStorage(),

    limits: {
      fileSize: maxFileSize,
    },

    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new BadRequestException(`Unsupported file type: ${file.mimetype}`),
          false,
        );
      }

      cb(null, true);
    },
  }) {}

  return mixin(MixinInterceptor);
}
