import { Inject, Injectable } from '@nestjs/common';
import { PasswordService } from 'src/common/services/password.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtOptions: ConfigType<typeof jwtConfig>,
  ) {}
  public async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.jwtOptions.secret,
      expiresIn: this.jwtOptions.expiresIn,
      audience: this.jwtOptions.audience,
      issuer: this.jwtOptions.issuer,
    });
  }
}
