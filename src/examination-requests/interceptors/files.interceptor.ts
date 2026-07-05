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

export function ExaminationAttachmentsInterceptor(
  fieldName = 'attachments',
  maxCount = 5,
): Type<NestInterceptor> {
  const uploadPath = './uploads/examination-requests';
  mkdirSync(uploadPath, { recursive: true });

  @Injectable()
  class MixinInterceptor extends FilesInterceptor(fieldName, maxCount, {
    storage: diskStorage({
      destination: uploadPath,
      filename: (req, file, cb) => {
        cb(null, `${uuid()}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Unsupported file type'), false);
      }
      cb(null, true);
    },
  }) { }

  return mixin(MixinInterceptor);
}
