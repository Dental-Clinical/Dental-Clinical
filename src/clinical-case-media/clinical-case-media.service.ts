import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClinicalCase } from 'src/clinical-case/clinical-case.entity';
import { ClinicalCaseStatus } from 'src/clinical-case/enums/clinical-case-status.enum';
import { StudentService } from 'src/students/student.service';
import { EntityManager } from 'typeorm';
import { ClinicalCaseMedia } from './clinical-case-media.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CaseMediaMetadataDto } from './dto/case-media-metadata.dto';

@Injectable()
export class ClinicalCaseMediaService {
  constructor(
    private readonly studentService: StudentService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: EntityManager,
  ) {}
  public async uploadMedia(
    clinicalCaseId: number,
    userId: number,
    files: Express.Multer.File[],
    metadata: CaseMediaMetadataDto[],
  ) {
    const student = await this.studentService.findByUserId(userId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const clinicalCase = await this.dataSource
      .getRepository(ClinicalCase)
      .findOne({
        where: { id: clinicalCaseId, assignedStudent: { id: student.id } },
        relations: {
          assignedStudent: true,
        },
      });

    if (!clinicalCase) {
      throw new NotFoundException(
        'Clinical case not found or not assigned to the student',
      );
    }

    if (clinicalCase.assignedStudent.id !== student.id) {
      throw new ConflictException(
        'You are not authorized to upload media for this clinical case',
      );
    }
    if (files.length === 0) {
      throw new ConflictException('No files provided for upload');
    }
    if (files.length != metadata.length) {
      throw new ConflictException(
        'Each uploaded file must have corresponding metadata.',
      );
    }
    const uploadedMedia = await this.cloudinaryService.uploadMany(
      files,
      `clinical-cases/${clinicalCaseId}`,
    );
    const clinicalCaseMedia = uploadedMedia.map((file, index) =>
      this.dataSource.getRepository(ClinicalCaseMedia).create({
        clinicalCase,
        uploadedBy: student,
        fileUrl: file.secure_url,
        publicId: file.public_id,
        fileName: files[index].originalname,
        mimeType: files[index].mimetype,
        description: metadata[index]?.description || '',
      }),
    );
    await this.dataSource
      .getRepository(ClinicalCaseMedia)
      .save(clinicalCaseMedia);
  }
}
