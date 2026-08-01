import { Module } from '@nestjs/common';
import { ExaminationRequestsService } from './examination-requests.service';
import { ExaminationRequestsController } from './examination-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExaminationRequest } from './entities/examination-request.entity';
import { ExaminationRequestTeeth } from './entities/examination-request-teeth.entity';
import { ExaminationRequestAttachments } from './entities/examination-request-attachment.entity';
import { ExaminationAppointment } from '../examination-appointments/examination-appointment.entity';
import { Patient } from 'src/patients/patient.entity';
import { ExaminationAppointmentsModule } from 'src/examination-appointments/examination-appointments.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [ExaminationRequestsService],
  controllers: [ExaminationRequestsController],
  imports: [
    TypeOrmModule.forFeature([
      ExaminationRequest,
      ExaminationAppointment,
      Patient,
      ExaminationRequestTeeth,
      ExaminationRequestAttachments,
    ]),
    ExaminationAppointmentsModule,
    CloudinaryModule,
  ],
})
export class ExaminationRequestsModule {}
