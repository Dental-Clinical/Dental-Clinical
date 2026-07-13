import {
  Injectable,
  NestInterceptor,
  mixin,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { mkdirSync } from 'fs';
import { UploadOptions } from '../interfaces/upload-options.interface';

export function FileUploadInterceptor(
  options: UploadOptions,
): Type<NestInterceptor> {
  const {
    uploadPath,
    fieldName = 'files',
    maxCount = 5,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize = 5 * 1024 * 1024,
  } = options;

  mkdirSync(uploadPath, { recursive: true });

  @Injectable()
  class MixinInterceptor extends FilesInterceptor(fieldName, maxCount, {
    storage: diskStorage({
      destination: uploadPath,
      filename: (req, file, cb) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      },
    }),

    limits: {
      fileSize: maxFileSize,
    },

    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new BadRequestException('Unsupported file type'), false);
      }

      cb(null, true);
    },
  }) {}

  return mixin(MixinInterceptor);
}
