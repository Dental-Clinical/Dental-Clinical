import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  public async createPatient(patient: CreatePatientDto): Promise<Patient> {
    patient.phone = this.normalizePhoneNumber(patient.phone);
    const existingPatient = await this.findPatientByPhone(patient.phone);
    if (existingPatient) {
      throw new HttpException(
        `Patient with phone ${patient.phone} already exists`,
        HttpStatus.CONFLICT,
      );
    }
    const newPatient = this.patientRepository.create({
      full_name: patient.full_name,
      phone: patient.phone,
      user: {
        id: patient.userId,
      } as User,
    });
    return await this.patientRepository.save(newPatient);
  }
  async updatePatient(id: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientRepository.findOne({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (updatePatientDto.userId) {
      patient.user = await this.userRepository.findOneByOrFail({
        id: updatePatientDto.userId,
      });
    }

    if (updatePatientDto.is_walkin !== undefined) {
      patient.is_walkin = updatePatientDto.is_walkin;
    }

    if (updatePatientDto.medical_history !== undefined) {
      patient.medical_history = updatePatientDto.medical_history;
    }

    if (updatePatientDto.current_medications !== undefined) {
      patient.current_medications = updatePatientDto.current_medications;
    }

    if (updatePatientDto.allergies !== undefined) {
      patient.allergies = updatePatientDto.allergies;
    }

    return await this.patientRepository.save(patient);
  }
  public async findPatientByPhone(phone: string): Promise<Patient | null> {
    phone = this.normalizePhoneNumber(phone);
    const patient = await this.patientRepository.findOneBy({
      phone,
    });

    return patient;
  }

  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, ''); // Remove non-numeric characters
  }
}
