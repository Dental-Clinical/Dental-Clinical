import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { UserModule } from 'src/users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { User } from 'src/users/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [PatientsService],
  controllers: [PatientsController],
  exports: [PatientsService],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Patient, User]),
    CloudinaryModule,
  ],
})
export class PatientsModule {}
