import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from 'src/common/services/password.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { WhatsappService } from 'src/notifications/whatsapp.service';
import { SendOtpDto } from './dto/sendOtp.dto';
import { OtpService } from './services/otp.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { randomUUID } from 'crypto';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/user.entity';
import { UserService } from 'src/users/user.service';
import { UserRole } from 'src/constants/user-roles';
import { PatientsService } from 'src/patients/patients.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { StaffLoginDto } from './dto/staffLogin.dto';
import { StudentService } from 'src/students/student.service';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DataSource } from 'typeorm';
import { UploadApiResponse } from 'cloudinary';
import { Patient } from 'src/patients/patient.entity';
import { AcademicYearsService } from 'src/academic-years/academic-years.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtOptions: ConfigType<typeof jwtConfig>,
    private readonly whatsappService: WhatsappService,
    private readonly otpService: OtpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService,
    private readonly patientService: PatientsService,
    private readonly sessionsService: SessionsService,
    private readonly studentService: StudentService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    private readonly academicYearService: AcademicYearsService,
  ) {}
  // register patient
  public async register(
    registerDto: RegisterDto,
    files: Express.Multer.File[],
  ) {
    const registration = await this.cacheManager.get<{ phone: string }>(
      `registration:${registerDto.registrationToken}`,
    );

    if (!registration) {
      throw new BadRequestException('Invalid or expired registration token');
    }

    const existingPatient = await this.patientService.findPatientByPhone(
      registration.phone,
    );

    if (existingPatient?.user) {
      throw new HttpException(
        'Patient already registered',
        HttpStatus.CONFLICT,
      );
    }

    const user = await this.userService.createUser({
      phone: registration.phone,
      full_name: registerDto.full_name,
      father_name: registerDto.father_name,
      role: UserRole.PATIENT,
    });
    if (existingPatient) {
      await this.patientService.updatePatient(existingPatient.id, {
        userId: user.id,
        is_walkin: false,
      });
    } else {
      await this.dataSource.transaction(async (manager) => {
        const patient = await this.patientService.createPatient(
          {
            phone: registration.phone,
            full_name: registerDto.full_name,
            dateOfBirth: registerDto.dateOfBirth,
            gender: registerDto.gender,
            userId: user.id,
          },
          manager, // preferably use the transaction manager
        );

        let uploaded: UploadApiResponse | undefined;

        try {
          if (files?.length) {
            uploaded = await this.cloudinaryService.uploadImage(
              files[0],
              `patients/${patient.id}`,
            );

            patient.profilePictureUrl = uploaded.secure_url;
            patient.profilePicturePublicId = uploaded.public_id;

            await manager.getRepository(Patient).save(patient);
          }

          return patient;
        } catch (error) {
          if (uploaded) {
            await this.cloudinaryService.delete(uploaded.public_id);
          }

          throw error;
        }
      });
    }
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.jwtOptions.expiresIn * 1000);

    await this.sessionsService.createSession(user, jti, 'Android', expiresAt);
    const accessToken = await this.generateAccessToken({
      sub: user.id,
      role: user.role,
      jti,
    });

    await this.cacheManager.del(
      `registration:${registerDto.registrationToken}`,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
  // send registration OTP
  public async sendRegistrationOtp(otpDto: SendOtpDto) {
    otpDto.phone = otpDto.phone.replace(/\D/g, ''); // Normalize phone number
    const user = await this.userService.findByPhone(otpDto.phone);
    if (user) {
      throw new HttpException('Account already exists', HttpStatus.CONFLICT);
    }
    const isCooldownActive = await this.otpService.isCooldownActive(
      otpDto.phone,
    );

    if (isCooldownActive) {
      throw new HttpException(
        'Please wait before requesting another OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const otp = this.otpService.generateOtp();

    await this.whatsappService.sendOtp(otpDto.phone, otp);
    console.log(`Sending OTP ${otp} to phone number ${otpDto.phone}`);

    await this.otpService.storeOtp(otpDto.phone, otp);

    await this.otpService.setCooldown(otpDto.phone);
    return {
      otp,
    };
  }
  // verify registration OTP
  public async verifyRegistrationOtp(verifyDto: VerifyOtpDto) {
    verifyDto.phone = verifyDto.phone.replace(/\D/g, ''); // Normalize phone number
    const isValid = await this.otpService.verifyOtp(
      verifyDto.phone,
      verifyDto.otp,
    );
    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    const registrationToken = randomUUID();
    await this.cacheManager.set(
      `registration:${registrationToken}`,
      { phone: verifyDto.phone },
      1000 * 60 * 10, // 10 minutes
    );
    return {
      registrationToken,
    };
  }
  // send login OTP
  public async sendLoginOtp(otpDto: SendOtpDto) {
    otpDto.phone = otpDto.phone.replace(/\D/g, '');
    const user = await this.userService.findByPhone(otpDto.phone);
    if (!user) {
      throw new HttpException(
        'Invalid phone number or account not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const isCooldownActive = await this.otpService.isCooldownActive(
      otpDto.phone,
    );

    if (isCooldownActive) {
      throw new HttpException(
        'Please wait before requesting another OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const otp = this.otpService.generateOtp();

    await this.whatsappService.sendOtp(otpDto.phone, otp);
    console.log(`Sending OTP ${otp} to phone number ${otpDto.phone}`);

    await this.otpService.storeOtp(otpDto.phone, otp);

    await this.otpService.setCooldown(otpDto.phone);
    return {
      otp,
    };
  }
  // verify login OTP
  public async verifyLoginOtp(verifyDto: VerifyOtpDto) {
    verifyDto.phone = verifyDto.phone.replace(/\D/g, ''); // Normalize phone number
    const isValid = await this.otpService.verifyOtp(
      verifyDto.phone,
      verifyDto.otp,
    );
    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findByPhone(verifyDto.phone);
    if (!user) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.jwtOptions.expiresIn * 1000);

    await this.sessionsService.createSession(user, jti, 'Android', expiresAt);
    const accessToken = await this.generateAccessToken({
      sub: user.id,
      role: user.role,
      jti,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
  // staff login
  public async staffLogin(dto: StaffLoginDto) {
    const user = await this.findStaffByEmail(dto.email);

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.is_active) {
      throw new UnauthorizedException(
        'Account is disabled. Please contact the administrator.',
      );
    }

    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + this.jwtOptions.expiresIn * 1000);

    await this.sessionsService.createSession(user, jti, 'Web', expiresAt);
    const accessToken = await this.generateAccessToken({
      sub: user.id,
      role: user.role,
      jti,
    });

    if (user.role === UserRole.STUDENT) {
      const academicYear =
        await this.academicYearService.getActiveAcademicYear();
      if (!academicYear) {
        throw new ForbiddenException(
          "You can't log in when no Academic Year is active",
        );
      }

      const studyYear = await this.studentService.getCurrentStudyYear(user.id);

      return {
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          role: user.role,
          name: user.full_name,
          academicYear: academicYear.academicYear,
          studyYear: studyYear.name,
        },
      };
    }

    return {
      accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
  // logout
  public async logout(currentUser: AuthenticatedUser) {
    await this.sessionsService.deleteSessionByJti(currentUser.jti);
  }
  // logout all sessions
  public async logoutAll(userId: number) {
    await this.sessionsService.deleteSessionsByUserId(userId);
  }
  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.jwtOptions.secret,
      expiresIn: this.jwtOptions.expiresIn,
      audience: this.jwtOptions.audience,
      issuer: this.jwtOptions.issuer,
    });
  }
  // helper function to check if the identifier is an email
  private isEmail(identifier: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  }
  // helper function to find staff by identifier (email or university ID)
  private async findStaffByEmail(email: string): Promise<User | null> {
    return await this.userService.findByEmail(email);
  }
}
