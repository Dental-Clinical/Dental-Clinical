import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './subjects.entity';
import { DataSource, In, Repository } from 'typeorm';
import { StudyYear } from 'src/study-years/study-years.entity';
import { Clinic } from 'src/clinic/clinic.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { GetSubjectsQueryDto } from './dto/get-subjects-query.dto';
import { GetSubjectMaterialsResponseDto } from './dto/get-subject-materials-response.dto';
import { Material } from 'src/materials/materials.entity';
import { SectionSubject } from 'src/section-subject/section-subject.entity';
import { Supervisor } from 'src/supervisors/supervisor.entity';
import {
  GetSupervisedSubjectsResponseDto,
  SupervisedSubjectItemDto,
} from './dto/get-supervised-subjects-response.dto';
import { AcademicYear } from 'src/academic-years/academic-years.entity';
import { Section } from 'src/section/section.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(StudyYear)
    private readonly studyYearRepository: Repository<StudyYear>,
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
    private readonly dataSource: DataSource,
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
      subjects: subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
      })),
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
      relations: {
        clinic: true,
        subjectProcedures: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      message: 'Subject retrieved successfully',
      subject: {
        id: subject.id,
        name: subject.name,
        shortName: subject.shortName,
        requiresDentalChart: subject.requiresDentalChart,
        clinic: {
          id: subject.clinic.id,
          name: subject.clinic.name,
        },
        procedures: subject.subjectProcedures.map((procedure) => ({
          procedureId: procedure.id,
          procedureName: procedure.name,
          requiredCount: procedure.required_count,
          description: procedure.description,
        })),
      },
    };
  }

  // async createSubject(dto: CreateSubjectDto) {
  //   return await this.dataSource.transaction(async (manager) => {
  //     const studyYear = await manager.getRepository(StudyYear).findOne({
  //       where: { id: dto.study_year_id },
  //     });
  //     if (!studyYear) {
  //       throw new NotFoundException('Study year not found');
  //     }

  //     // Subjects belong to a clinic
  //     const clinic = await manager.getRepository(Clinic).findOne({
  //       where: { id: dto.clinic_id },
  //     });
  //     if (!clinic) {
  //       throw new NotFoundException(
  //         'No clinic exists with the provided clinic_id. Please provide a valid clinic_id.',
  //       );
  //     }

  //     const existing = await manager.getRepository(Subject).findOne({
  //       where: { studyYear: { id: dto.study_year_id }, name: dto.name },
  //     });
  //     if (existing) {
  //       throw new ConflictException(
  //         'A subject with this name already exists for this study year',
  //       );
  //     }

  //     const subject = manager.getRepository(Subject).create({
  //       name: dto.name,
  //       shortName: dto.shortName,
  //       is_active: dto.is_active,
  //       requiresDentalChart: dto.requiresDentalChart,
  //       studyYear,
  //       clinic,
  //     });
  //     const uniqueSectionIds = [
  //       ...new Set(dto.section_supervisors.map((s) => s.section_id)),
  //     ];
  //     if (uniqueSectionIds.length !== dto.section_supervisors.length) {
  //       throw new ConflictException(
  //         'Duplicate section IDs found in the request. Please provide unique section IDs.',
  //       );
  //     }
  //     const uniqueSectionSupervisorIds = [
  //       ...new Set(dto.section_supervisors.map((s) => s.section_id)),
  //     ];
  //     if (
  //       uniqueSectionSupervisorIds.length !== dto.section_supervisors.length
  //     ) {
  //       throw new ConflictException(
  //         'Duplicate section IDs found in the request. Please provide unique section IDs.',
  //       );
  //     }
  //     const academicYear = await manager.getRepository(AcademicYear).findOne({
  //       where: { is_active: true },
  //     });
  //     if (!academicYear) {
  //       throw new NotFoundException(
  //         'No active academic year found. Please ensure there is an active academic year before creating a subject.',
  //       );
  //     }
  //     for (const sectionSupervisor of dto.section_supervisors) {
  //       const sectionSubject = await manager
  //         .getRepository(SectionSubject)
  //         .create({
  //           academicYear,
  //           section: { id: sectionSupervisor.section_id },
  //           supervisor: { id: sectionSupervisor.supervisor_id },
  //           subject,
  //         });
  //       await manager.getRepository(SectionSubject).save(sectionSubject);
  //     }

  //     try {
  //       const saved = await manager.getRepository(Subject).save(subject);
  //       return {
  //         message: 'Subject created successfully',
  //         data: saved,
  //       };
  //     } catch (error: any) {
  //       if (error.code === '23505') {
  //         throw new ConflictException(
  //           'A subject with this name already exists for this study year',
  //         );
  //       }
  //       throw error;
  //     }
  //   });
  // }
  async createSubject(dto: CreateSubjectDto) {
    return this.dataSource.transaction(async (manager) => {
      const subjectRepository = manager.getRepository(Subject);
      const studyYearRepository = manager.getRepository(StudyYear);
      const clinicRepository = manager.getRepository(Clinic);
      const sectionRepository = manager.getRepository(Section);
      const supervisorRepository = manager.getRepository(Supervisor);
      const academicYearRepository = manager.getRepository(AcademicYear);
      const sectionSubjectRepository = manager.getRepository(SectionSubject);

      // 1. Validate study year
      const studyYear = await studyYearRepository.findOne({
        where: { id: dto.study_year_id },
      });

      if (!studyYear) {
        throw new NotFoundException('Study year not found');
      }

      // 2. Validate clinic
      const clinic = await clinicRepository.findOne({
        where: { id: dto.clinic_id },
      });

      if (!clinic) {
        throw new NotFoundException('Clinic not found');
      }

      // 3. Validate active academic year
      const academicYear = await academicYearRepository.findOne({
        where: { is_active: true },
      });

      if (!academicYear) {
        throw new NotFoundException('No active academic year found.');
      }

      // 5. Validate duplicate sections in request
      const sectionIds = dto.section_supervisors.map((item) => item.section_id);

      const uniqueSectionIds = new Set(sectionIds);

      if (uniqueSectionIds.size !== sectionIds.length) {
        throw new ConflictException('Each section can only be assigned once.');
      }

      // 6. Load sections
      const sections = await sectionRepository.find({
        where: sectionIds.map((id) => ({ id })),
      });

      if (sections.length !== uniqueSectionIds.size) {
        const foundIds = new Set(sections.map((section) => section.id));

        const missingIds = sectionIds.filter((id) => !foundIds.has(id));

        throw new NotFoundException(
          `Sections not found: ${missingIds.join(', ')}`,
        );
      }

      // 7. Make sure every section belongs to the clinic
      const invalidSection = sections.find(
        (section) => section.clinic_id !== clinic.id,
      );

      if (invalidSection) {
        throw new ConflictException(
          `Section ${invalidSection.id} does not belong to this clinic.`,
        );
      }

      // 8. Load supervisors
      const supervisorIds = [
        ...new Set(dto.section_supervisors.map((item) => item.supervisor_id)),
      ];

      const supervisors = await supervisorRepository.find({
        where: supervisorIds.map((id) => ({ id })),
      });

      if (supervisors.length !== supervisorIds.length) {
        const foundIds = new Set(
          supervisors.map((supervisor) => supervisor.id),
        );

        const missingIds = supervisorIds.filter((id) => !foundIds.has(id));

        throw new NotFoundException(
          `Supervisors not found: ${missingIds.join(', ')}`,
        );
      }

      // 9. Check duplicate subject name
      const existing = await subjectRepository.findOne({
        where: {
          studyYear: { id: studyYear.id },
          name: dto.name,
        },
      });

      if (existing) {
        throw new ConflictException(
          'A subject with this name already exists for this study year.',
        );
      }

      // 10. Create subject
      const subject = subjectRepository.create({
        name: dto.name,
        shortName: dto.shortName,
        is_active: dto.is_active ?? true,
        requiresDentalChart: dto.requiresDentalChart ?? true,
        studyYear,
        clinic,
      });

      // IMPORTANT: save subject first
      const savedSubject = await subjectRepository.save(subject);

      // 11. Create SectionSubject assignments
      const sectionMap = new Map(
        sections.map((section) => [section.id, section]),
      );

      const supervisorMap = new Map(
        supervisors.map((supervisor) => [supervisor.id, supervisor]),
      );

      const assignments = dto.section_supervisors.map((item) =>
        sectionSubjectRepository.create({
          academicYear,
          subject: savedSubject,
          section: sectionMap.get(item.section_id)!,
          supervisor: supervisorMap.get(item.supervisor_id)!,
        }),
      );

      await sectionSubjectRepository.save(assignments);

      return {
        message: 'Subject created successfully.',
        data: {
          id: savedSubject.id,
          name: savedSubject.name,
          shortName: savedSubject.shortName,
          studyYear: studyYear.name,
          clinic: clinic.name,
          assignments: assignments.map((assignment) => ({
            sectionId: assignment.section.id,
            supervisorId: assignment.supervisor.id,
          })),
        },
      };
    });
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
    if (dto.shortName !== undefined) {
      subject.shortName = dto.shortName;
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
        diagnosisQuestions: {
          answerOptions: true,
        },
      },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      requiresDentalChart: subject.requiresDentalChart,
      procedures: subject.subjectProcedures.map((procedure) => ({
        procedureId: procedure.id,
        procedureName: procedure.name,
        requiredCount: procedure.required_count,
        description: procedure.description,
      })),
      questions: subject.diagnosisQuestions
        .filter((question) => question.isActive)
        .map((question) => ({
          questionId: question.id,
          questionText: question.question,
          questionType: question.type,
          required: question.required,
          displayOrder: question.displayOrder,
          answerOptions:
            question.answerOptions
              .filter((option) => option.isActive)
              .map((option) => ({
                optionId: option.id,
                optionText: option.label,
                displayOrder: option.displayOrder,
              })) ?? [],
        })),
    };
  }

  async addMaterialsToSubject(subjectId: number, materialIds: number[]) {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
      relations: {
        materials: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const uniqueMaterialIds = [...new Set(materialIds)];

    const existingIds = new Set(
      subject.materials.map((material) => material.id),
    );

    const newMaterialIds = uniqueMaterialIds.filter(
      (id) => !existingIds.has(id),
    );
    if (newMaterialIds.length === 0) {
      return {
        message: 'All provided materials are already assigned to this subject.',
        added: 0,
      };
    }

    const materials = await this.materialRepository.findBy({
      id: In(newMaterialIds),
    });

    if (materials.length !== newMaterialIds.length) {
      throw new NotFoundException('One or more materials not found');
    }

    subject.materials.push(...materials);
    await this.subjectRepository.save(subject);
    return {
      message: 'Materials added to subject successfully',
      added: materials.length,
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

  async getSupervisedSubjects(
    userId: number,
  ): Promise<GetSupervisedSubjectsResponseDto> {
    const supervisor = await this.supervisorRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    const assignments = await this.sectionSubjectRepository.find({
      where: {
        supervisor: { id: supervisor.id },
        subject: { is_active: true },
        academicYear: { is_active: true },
      },
      relations: {
        section: { clinic: true },
        subject: { subjectProcedures: true },
        academicYear: true,
      },
    });

    const subjectsById = new Map<number, SupervisedSubjectItemDto>();

    for (const assignment of assignments) {
      const { subject, section, academicYear } = assignment;

      let supervisedSubject = subjectsById.get(subject.id);
      if (!supervisedSubject) {
        supervisedSubject = {
          subjectId: subject.id,
          subjectName: subject.name,
          shortName: subject.shortName,
          requiresDentalChart: subject.requiresDentalChart,
          academicYear: {
            id: academicYear.id,
            label: academicYear.label,
          },
          sections: [],
          procedures: subject.subjectProcedures
            .filter((procedure) => procedure.is_active)
            .map((procedure) => ({
              procedureId: procedure.id,
              procedureName: procedure.name,
              requiredCount: procedure.required_count,
              description: procedure.description,
            })),
        };
        subjectsById.set(subject.id, supervisedSubject);
      }

      if (
        !supervisedSubject.sections.some(
          (existing) => existing.sectionId === section.id,
        )
      ) {
        supervisedSubject.sections.push({
          sectionId: section.id,
          sectionName: section.name,
          clinic: { id: section.clinic.id, name: section.clinic.name },
        });
      }
    }

    return { subjects: [...subjectsById.values()] };
  }
}
