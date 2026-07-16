import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicYear } from './academic-years.entity';
import { Repository } from 'typeorm';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { GetAcademicYearsQueryDto } from './dto/get-academic-years-query.dto';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async getAcademicYears(dto: GetAcademicYearsQueryDto) {
    const qb = this.academicYearRepository.createQueryBuilder('academicYear');

    if (dto.search) {
      qb.andWhere('academicYear.label ILIKE :search', {
        search: `%${dto.search}%`,
      });
    }

    if (dto.is_active !== undefined) {
      qb.andWhere('academicYear.is_active = :is_active', {
        is_active: dto.is_active,
      });
    }

    qb.orderBy('academicYear.start_date', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [academicYears, total] = await qb.getManyAndCount();

    return {
      message: 'Academic years retrieved successfully',
      data: academicYears,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getAcademicYearById(id: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    return {
      message: 'Academic year retrieved successfully',
      data: academicYear,
    };
  }

  async createAcademicYear(dto: CreateAcademicYearDto) {
    this.validateDateRange(dto.start_date, dto.end_date);

    const existing = await this.academicYearRepository.findOne({
      where: { label: dto.label },
    });
    if (existing) {
      throw new ConflictException(
        'Academic year with this label already exists',
      );
    }

    const academicYear = this.academicYearRepository.create(dto);

    try {
      const saved = await this.academicYearRepository.save(academicYear);
      return {
        message: 'Academic year created successfully',
        data: saved,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
      throw error;
    }
  }

  async updateAcademicYear(id: number, dto: UpdateAcademicYearDto) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const start_date = dto.start_date ?? academicYear.start_date;
    const end_date = dto.end_date ?? academicYear.end_date;
    this.validateDateRange(start_date, end_date);

    if (dto.label && dto.label !== academicYear.label) {
      const existing = await this.academicYearRepository.findOne({
        where: { label: dto.label },
      });
      if (existing) {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
    }

    Object.assign(academicYear, dto);

    try {
      const updated = await this.academicYearRepository.save(academicYear);
      return {
        message: 'Academic year updated successfully',
        data: updated,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Academic year with this label already exists',
        );
      }
      throw error;
    }
  }

  async deleteAcademicYear(id: number) {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    await this.academicYearRepository.remove(academicYear);

    return {
      message: 'Academic year deleted successfully',
    };
  }

  private validateDateRange(
    start_date: string | Date,
    end_date: string | Date,
  ) {
    if (new Date(end_date).getTime() <= new Date(start_date).getTime()) {
      throw new BadRequestException('end_date must be after start_date');
    }
  }
}
