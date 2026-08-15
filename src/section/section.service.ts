import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './section.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { StudentSubjectEnrollment } from 'src/student-subject-enrollment/student-subject-enrollment.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { GetSectionsQueryDto } from './dto/get-section-query.dto';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
    @InjectRepository(StudentSubjectEnrollment)
    private readonly enrollmentRepository: Repository<StudentSubjectEnrollment>,
  ) {}

  async getSections(dto: GetSectionsQueryDto) {
    const qb = this.sectionRepository.createQueryBuilder('section');
    qb.leftJoinAndSelect('section.clinic', 'clinic');
    if (dto.search) {
      qb.andWhere('section.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.clinic_id !== undefined) {
      qb.andWhere('section.clinic_id = :clinicId', { clinicId: dto.clinic_id });
    }

    qb.orderBy('section.id', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [sections, total] = await qb.getManyAndCount();

    return {
      message: 'Sections retrieved successfully',
      data: sections.map((section) => ({
        id: section.id,
        name: section.name,
        clinic: {
          id: section.clinic.id,
          name: section.clinic.name,
        },
      })),
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getSectionById(id: number) {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: {
        clinic: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return {
      message: 'Section retrieved successfully',
      section: {
        id: section.id,
        name: section.name,
        clinic: {
          id: section.clinic.id,
          name: section.clinic.name,
        },
      },
    };
  }

  // async createSection(dto: CreateSectionDto) {
  //   const clinic = await this.resolveClinic(dto.clinic_id);

  //   await this.ensureNameIsAvailable(dto.name, dto.clinic_id);

  //   const section = this.sectionRepository.create({
  //     name: dto.name,
  //     clinic,
  //   });

  //   const saved = await this.sectionRepository.save(section);
  //   return {
  //     message: 'Section created successfully',
  //     data: saved,
  //   };
  // }

  // async updateSection(id: number, dto: UpdateSectionDto) {
  //   const section = await this.sectionRepository.findOne({
  //     where: { id },
  //   });

  //   if (!section) {
  //     throw new NotFoundException('Section not found');
  //   }

  //   const targetName = dto.name ?? section.name;
  //   const targetClinicId = dto.clinic_id ?? section.clinic_id;

  //   if (targetName !== section.name || targetClinicId !== section.clinic_id) {
  //     await this.ensureNameIsAvailable(targetName, targetClinicId, id);
  //   }

  //   if (dto.clinic_id !== undefined) {
  //     section.clinic = await this.resolveClinic(dto.clinic_id);
  //   }
  //   if (dto.name !== undefined) {
  //     section.name = dto.name;
  //   }

  //   const updated = await this.sectionRepository.save(section);
  //   return {
  //     message: 'Section updated successfully',
  //     data: updated,
  //   };
  // }

  async deleteSection(id: number) {
    const section = await this.sectionRepository.findOne({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // section_subjects.section_id is ON DELETE RESTRICT and
    // student_subject_enrollments.section_id is ON DELETE NO ACTION, so a
    // section still in use would fail at the database level with a raw 23503.
    const [sectionSubjectCount, enrollmentCount] = await Promise.all([
      this.sectionSubjectRepository.count({ where: { section: { id } } }),
      this.enrollmentRepository.count({ where: { section: { id } } }),
    ]);
    if (sectionSubjectCount > 0 || enrollmentCount > 0) {
      throw new ConflictException(
        'Cannot delete a section that still has subjects or student enrollments',
      );
    }

    try {
      await this.sectionRepository.remove(section);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new ConflictException(
          'Cannot delete a section that still has subjects or student enrollments',
        );
      }
      throw error;
    }

    return {
      message: 'Section deleted successfully',
    };
  }

  private async resolveClinic(id: number) {
    const clinic = await this.clinicRepository.findOne({ where: { id } });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }
    return clinic;
  }

  private async ensureNameIsAvailable(
    name: string,
    clinicId: number,
    excludeId?: number,
  ) {
    const qb = this.sectionRepository
      .createQueryBuilder('section')
      .where('section.name ILIKE :name', { name })
      .andWhere('section.clinic_id = :clinicId', { clinicId });

    if (excludeId !== undefined) {
      qb.andWhere('section.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        'A section with this name already exists for this clinic',
      );
    }
  }
}
