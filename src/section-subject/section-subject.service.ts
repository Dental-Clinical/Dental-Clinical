import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionSubject } from './section-subject.entity';

@Injectable()
export class SectionSubjectService {
  constructor(
    @InjectRepository(SectionSubject)
    private readonly sectionSubjectRepository: Repository<SectionSubject>,
  ) {}
}
