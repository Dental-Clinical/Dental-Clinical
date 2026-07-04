import { Module } from '@nestjs/common';
import { ExaminationRequestsService } from './examination-requests.service';
import { ExaminationRequestsController } from './examination-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExaminationRequest } from './entities/examination-request.entity';
import { ExaminationRequestTeeth } from './entities/examination-request-teeth.entity';
import { ExaminationRequestAttachments } from './entities/examination-request-attachment.entity';
import { ExaminationAppointment } from './entities/examination-request-appointment.entity';
import { Patient } from 'src/patients/patient.entity';

@Module({
  providers: [ExaminationRequestsService],
  controllers: [ExaminationRequestsController],
  imports: [TypeOrmModule.forFeature([ExaminationRequest, ExaminationAppointment, Patient, ExaminationRequestTeeth, ExaminationRequestAttachments])]
})
export class ExaminationRequestsModule { }
