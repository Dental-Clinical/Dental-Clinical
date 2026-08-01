import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicSections } from './clinic-sections.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import { CreateClinicSectionDto } from './dto/create-clinic-section.dto';
import { UpdateClinicSectionDto } from './dto/update-clinic-section.dto';
import { GetClinicSectionsQueryDto } from './dto/get-clinic-sections-query.dto';

@Injectable()
export class ClinicSectionsService {
  constructor(
    @InjectRepository(ClinicSections)
    private readonly clinicSectionRepository: Repository<ClinicSections>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
  ) {}

  async getClinicSections(dto: GetClinicSectionsQueryDto) {
    const qb = this.clinicSectionRepository.createQueryBuilder('clinicSection');

    if (dto.subject_id !== undefined) {
      qb.andWhere('clinicSection.subject_id = :subjectId', {
        subjectId: dto.subject_id,
      });
    }

    if (dto.supervisor_id !== undefined) {
      qb.andWhere('clinicSection.supervisor_id = :supervisorId', {
        supervisorId: dto.supervisor_id,
      });
    }

    if (dto.search) {
      qb.andWhere('clinicSection.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('clinicSection.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('clinicSection.createdAt', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [clinicSections, total] = await qb.getManyAndCount();

    return {
      message: 'Clinic sections retrieved successfully',
      data: clinicSections,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getClinicSectionById(id: number) {
    const clinicSection = await this.clinicSectionRepository.findOne({
      where: { id },
    });

    if (!clinicSection) {
      throw new NotFoundException('Clinic section not found');
    }

    return {
      message: 'Clinic section retrieved successfully',
      data: clinicSection,
    };
  }

  async createClinicSection(dto: CreateClinicSectionDto) {
    const supervisor = await this.resolveSupervisor(dto.supervisor_id);

    const existing = await this.clinicSectionRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A section with this name already exists');
    }

    const clinicSection = this.clinicSectionRepository.create({
      name: dto.name,
      is_active: dto.is_active,
      supervisor,
    });

    const saved = await this.clinicSectionRepository.save(clinicSection);
    return {
      message: 'Clinic section created successfully',
      data: saved,
    };
  }

  async updateClinicSection(id: number, dto: UpdateClinicSectionDto) {
    const clinicSection = await this.clinicSectionRepository.findOne({
      where: { id },
    });

    if (!clinicSection) {
      throw new NotFoundException('Clinic section not found');
    }

    if (dto.supervisor_id !== undefined) {
      clinicSection.supervisor = await this.resolveSupervisor(
        dto.supervisor_id,
      );
    }

    const targetName = dto.name ?? clinicSection.name;

    if (dto.name !== undefined && targetName !== clinicSection.name) {
      const existing = await this.clinicSectionRepository.findOne({
        where: { name: targetName },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('A section with this name already exists');
      }
    }

    if (dto.name !== undefined) {
      clinicSection.name = dto.name;
    }
    if (dto.is_active !== undefined) {
      clinicSection.is_active = dto.is_active;
    }

    const updated = await this.clinicSectionRepository.save(clinicSection);
    return {
      message: 'Clinic section updated successfully',
      data: updated,
    };
  }

  async deleteClinicSection(id: number) {
    const clinicSection = await this.clinicSectionRepository.findOne({
      where: { id },
    });

    if (!clinicSection) {
      throw new NotFoundException('Clinic section not found');
    }

    await this.clinicSectionRepository.remove(clinicSection);

    return {
      message: 'Clinic section deleted successfully',
    };
  }

  private async resolveSubject(subjectId: number) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return subject;
  }

  private async resolveSupervisor(supervisorId: number) {
    const supervisor = await this.supervisorRepository.findOne({
      where: { id: supervisorId },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }
    return supervisor;
  }
}
