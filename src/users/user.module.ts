import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { CommonModule } from 'src/common/common.module';
import { StudentModule } from 'src/students/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CommonModule,
    forwardRef(() => StudentModule),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
