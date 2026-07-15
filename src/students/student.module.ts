import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { UserModule } from 'src/users/user.module';
import { CommonModule } from 'src/common/common.module';
import { StudentSection } from 'src/student-section/student-section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentSection]),
    forwardRef(() => UserModule),
    CommonModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
