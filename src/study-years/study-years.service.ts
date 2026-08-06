import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudyYear } from './study-years.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudyYearsService {
  constructor(
    @InjectRepository(StudyYear)
    private readonly studyYearRepository: Repository<StudyYear>,
  ) {}
  async getStudyYears() {
    const studyYears = await this.studyYearRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return {
      message: 'Study years retrieved successfully',
      data: studyYears.map((studyYear) => ({
        id: studyYear.id,
        name: studyYear.name,
        level: studyYear.level,
      })),
    };
  }
}
