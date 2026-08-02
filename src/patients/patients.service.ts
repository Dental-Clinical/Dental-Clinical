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
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { UpdatePatientMedicalRecordsDto } from './dto/update-patient-medical-records.dto';
import { User } from 'src/users/user.entity';
import { log } from 'console';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
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
      user: patient.userId ? { id: patient.userId } : undefined,
      allergies: patient.allergies,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medical_history: patient.medical_history,
      current_medications: patient.current_medications,
      is_walkin: !patient.userId,
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
  async updateMyProfile(
    userId: number,
    updatePatientDto: UpdatePatientProfileDto,
  ) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (updatePatientDto.full_name !== undefined) {
      patient.full_name = updatePatientDto.full_name;
    }

    if (updatePatientDto.phone !== undefined) {
      const phone = this.normalizePhoneNumber(updatePatientDto.phone);
      const existingPatient = await this.findPatientByPhone(phone);

      if (existingPatient && existingPatient.id !== patient.id) {
        throw new HttpException(
          `Patient with phone ${phone} already exists`,
          HttpStatus.CONFLICT,
        );
      }

      patient.phone = phone;
    }

    if (updatePatientDto.dateOfBirth !== undefined) {
      patient.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    }

    if (updatePatientDto.gender !== undefined) {
      patient.gender = updatePatientDto.gender;
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

    const savedPatient = await this.patientRepository.save(patient);

    return {
      message: 'Profile updated successfully',
      patient: savedPatient,
    };
  }
  public async findPatientByPhone(phone: string): Promise<Patient | null> {
    phone = this.normalizePhoneNumber(phone);
    const patient = await this.patientRepository.findOneBy({
      phone,
    });

    return patient;
  }
  public async getPatientProfile(userId: number) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      message: 'Patient profile retrieved successfully',
      patient,
    };
  }
  private normalizePhoneNumber(phone: string): string {
    return phone.replace(/\D/g, ''); // Remove non-numeric characters
  }
  public async updateMedicalRecords(
    patientId: number,
    updatePatientDto: UpdatePatientMedicalRecordsDto,
  ) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
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

    const savedPatient = await this.patientRepository.save(patient);

    return {
      message: 'Medical records updated successfully',
      patient: savedPatient,
    };
  }

  async getAllPatients() {
    return await this.patientRepository.find()
  }
}
