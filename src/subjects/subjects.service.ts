import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subjects.entity';
import { Repository } from 'typeorm';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { GetSubjectsQueryDto } from './dto/get-subjects-query.dto';
import { GetSubjectMaterialsResponseDto } from './dto/get-subject-materials-response.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(StudyYear)
    private readonly studyYearRepository: Repository<StudyYear>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async getSubjects(dto: GetSubjectsQueryDto) {
    const qb = this.subjectRepository.createQueryBuilder('subject');

    if (dto.study_year_id !== undefined) {
      qb.andWhere('subject.study_year_id = :studyYearId', {
        studyYearId: dto.study_year_id,
      });
    }

    if (dto.search) {
      qb.andWhere('subject.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('subject.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('subject.id', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [subjects, total] = await qb.getManyAndCount();

    return {
      message: 'Subjects retrieved successfully',
      data: subjects,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getSubjectById(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      message: 'Subject retrieved successfully',
      data: subject,
    };
  }

  async createSubject(dto: CreateSubjectDto) {
    const studyYear = await this.studyYearRepository.findOne({
      where: { id: dto.study_year_id },
    });
    if (!studyYear) {
      throw new NotFoundException('Study year not found');
    }

    // Subjects belong to a clinic, and the faculty runs one per academic year.
    const clinic = await this.clinicRepository.findOne({
      where: { academicYear: { is_active: true } },
    });
    if (!clinic) {
      throw new NotFoundException('No clinic exists for the active academic year');
    }

    const existing = await this.subjectRepository.findOne({
      where: { studyYear: { id: dto.study_year_id }, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A subject with this name already exists for this study year',
      );
    }

    const subject = this.subjectRepository.create({
      name: dto.name,
      description: dto.description,
      is_active: dto.is_active,
      studyYear,
      clinic,
    });

    try {
      const saved = await this.subjectRepository.save(subject);
      return {
        message: 'Subject created successfully',
        data: saved,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'A subject with this name already exists for this study year',
        );
      }
      throw error;
    }
  }

  async updateSubject(id: number, dto: UpdateSubjectDto) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (dto.study_year_id !== undefined) {
      const studyYear = await this.studyYearRepository.findOne({
        where: { id: dto.study_year_id },
      });
      if (!studyYear) {
        throw new NotFoundException('Study year not found');
      }
      subject.studyYear = studyYear;
    }

    const targetStudyYearId = dto.study_year_id ?? subject.study_year_id;
    const targetName = dto.name ?? subject.name;

    if (
      (dto.name !== undefined || dto.study_year_id !== undefined) &&
      (targetName !== subject.name ||
        targetStudyYearId !== subject.study_year_id)
    ) {
      const existing = await this.subjectRepository.findOne({
        where: { studyYear: { id: targetStudyYearId }, name: targetName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'A subject with this name already exists for this study year',
        );
      }
    }

    if (dto.name !== undefined) {
      subject.name = dto.name;
    }
    if (dto.description !== undefined) {
      subject.description = dto.description;
    }
    if (dto.is_active !== undefined) {
      subject.is_active = dto.is_active;
    }

    try {
      const updated = await this.subjectRepository.save(subject);
      return {
        message: 'Subject updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'A subject with this name already exists for this study year',
        );
      }
      throw error;
    }
  }

  async deleteSubject(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    await this.subjectRepository.remove(subject);

    return {
      message: 'Subject deleted successfully',
    };
  }

  async getSubjectProcedures(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: {
        subjectProcedures: true,
      },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      procedures: subject.subjectProcedures.map((procedure) => ({
        procedureId: procedure.id,
        procedureName: procedure.name,
        description: procedure.description,
      })),
    };
  }

  async getSubjectMaterials(
    subjectId: number,
  ): Promise<GetSubjectMaterialsResponseDto> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: {
        materials: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      materials: subject.materials.map((material) => ({
        materialId: material.id,
        materialName: material.name,
      })),
    };
  }
}
