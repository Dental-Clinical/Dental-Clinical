import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { Section } from 'src/section/section.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { GetClinicsQueryDto } from './dto/get-clinics-query.dto';

@Injectable()
export class ClinicService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly dataSource: DataSource,
  ) {}

  async getClinics(dto: GetClinicsQueryDto) {
    const qb = this.clinicRepository.createQueryBuilder('clinic');

    if (dto.search) {
      qb.andWhere('clinic.name ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    qb.leftJoinAndSelect('clinic.sections', 'section');

    qb.orderBy('clinic.id', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [clinics, total] = await qb.getManyAndCount();

    return {
      message: 'Clinics retrieved successfully',
      clinics: clinics.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        description: clinic.description,
        sections: clinic.sections.map((section) => ({
          id: section.id,
          name: section.name,
        })),
      })),
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getClinicById(id: number) {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return {
      message: 'Clinic retrieved successfully',
      data: clinic,
    };
  }

  async createClinic(dto: CreateClinicDto) {
    const existing = await this.clinicRepository.findOne({
      where: {
        name: dto.name,
      },
    });
    if (existing) {
      throw new ConflictException('A clinic with this name already exists');
    }
    return await this.dataSource.transaction(async (manager) => {
      const clinic = this.clinicRepository.create({
        name: dto.name,
        description: dto.description,
      });
      const savedClinic = await manager.save(clinic);
      const sections = dto.sections.map((sectionDto) =>
        manager.getRepository(Section).create({
          name: sectionDto.name,
          clinic: savedClinic,
        }),
      );
      await manager.save(sections);
      return {
        message: 'Clinic created successfully',
        data: savedClinic,
      };
    });
  }

  async updateClinic(id: number, dto: UpdateClinicDto) {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const targetName = dto.name ?? clinic.name;

    if (dto.name !== undefined && targetName !== clinic.name) {
      const existing = await this.clinicRepository.findOne({
        where: {
          name: targetName,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('A clinic with this name already exists');
      }
    }

    if (dto.name !== undefined) {
      clinic.name = dto.name;
    }
    if (dto.description !== undefined) {
      clinic.description = dto.description;
    }

    try {
      const updated = await this.clinicRepository.save(clinic);
      return {
        message: 'Clinic updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('A clinic with this name already exists');
      }
      throw error;
    }
  }

  async deleteClinic(id: number) {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // subjects.clinic_id and sections.clinic_id are ON DELETE NO ACTION, so a
    // clinic with children would fail at the database level with a raw 23503.
    const [subjectCount, sectionCount] = await Promise.all([
      this.subjectRepository.count({ where: { clinic: { id } } }),
      this.sectionRepository.count({ where: { clinic: { id } } }),
    ]);
    if (subjectCount > 0 || sectionCount > 0) {
      throw new ConflictException(
        'Cannot delete a clinic that still has subjects or sections',
      );
    }

    try {
      await this.clinicRepository.remove(clinic);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new ConflictException(
          'Cannot delete a clinic that still has subjects or sections',
        );
      }
      throw error;
    }

    return {
      message: 'Clinic deleted successfully',
    };
  }
}
