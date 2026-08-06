import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './materials.entity';
import { Subject } from 'src/subjects/subjects.entity';
import { SessionMaterial } from 'src/session-materials/session-materials.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { GetMaterialsQueryDto } from './dto/get-material-query.dto';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(SessionMaterial)
    private readonly sessionMaterialRepository: Repository<SessionMaterial>,
  ) {}

  async getMaterials(dto: GetMaterialsQueryDto) {
    const qb = this.materialRepository.createQueryBuilder('material');

    if (dto.search) {
      qb.andWhere('material.name ILIKE :search', { search: `%${dto.search}%` });
    }

    qb.orderBy('material.id', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [materials, total] = await qb.getManyAndCount();

    return {
      message: 'Materials retrieved successfully',
      data: materials,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async getMaterialById(id: number) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    return { message: 'Material retrieved successfully', data: material };
  }

  async createMaterial(dto: CreateMaterialDto) {
    await this.ensureNameIsAvailable(dto.name);

    const material = this.materialRepository.create({
      name: dto.name,
      description: dto.description,
    });

    const saved = await this.materialRepository.save(material);
    return { message: 'Material created successfully', data: saved };
  }

  async updateMaterial(id: number, dto: UpdateMaterialDto) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (dto.name !== undefined && dto.name !== material.name) {
      await this.ensureNameIsAvailable(dto.name, id);
      material.name = dto.name;
    }

    if (dto.description !== undefined) {
      material.description = dto.description;
    }

    const updated = await this.materialRepository.save(material);
    return { message: 'Material updated successfully', data: updated };
  }

  async deleteMaterial(id: number) {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // subject_materials.material_id and session_materials.material_id are both
    // ON DELETE NO ACTION, so a material still in use would fail at the database
    // level with a raw 23503.
    const [subjectCount, sessionMaterialCount] = await Promise.all([
      this.subjectRepository.count({ where: { materials: { id } } }),
      this.sessionMaterialRepository.count({ where: { material: { id } } }),
    ]);
    if (subjectCount > 0 || sessionMaterialCount > 0) {
      throw new ConflictException(
        'Cannot delete a material that is still used by subjects or treatment sessions',
      );
    }

    try {
      await this.materialRepository.remove(material);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new ConflictException(
          'Cannot delete a material that is still used by subjects or treatment sessions',
        );
      }
      throw error;
    }

    return { message: 'Material deleted successfully' };
  }

  private async ensureNameIsAvailable(name: string, excludeId?: number) {
    const qb = this.materialRepository
      .createQueryBuilder('material')
      .where('material.name ILIKE :name', { name });

    if (excludeId !== undefined) {
      qb.andWhere('material.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException('A material with this name already exists');
    }
  }
}
