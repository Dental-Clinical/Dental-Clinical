import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UserRole } from 'src/constants/user-roles';
import { StudentProgressService } from './student-progress.service';
import { GetStudentProcedureProgressResponseDto } from './dto/student-procedure-progress-response.dto';

@ApiTags('Student Procedure Progress')
@ApiBearerAuth('JWT-auth')
@Controller('students')
export class StudentProgressController {
  constructor(
    private readonly studentProgressService: StudentProgressService,
  ) {}

  @Get('me/procedure-progress')
  @Roles([UserRole.STUDENT])
  @ApiOperation({
    summary:
      "[Student] Get the current student's procedure progress by subject",
  })
  @ApiOkResponse({
    type: GetStudentProcedureProgressResponseDto,
    description: 'Procedure progress retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student or current enrollment not found',
  })
  public async getMyProcedureProgress(@CurrentUser() user: AuthenticatedUser) {
    return await this.studentProgressService.getMyProcedureProgress(user);
  }
}
