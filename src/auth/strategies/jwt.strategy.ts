import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import jwtConfig from 'src/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { SessionsService } from 'src/sessions/sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtOptions: ConfigType<typeof jwtConfig>,
    private readonly sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtOptions.secret!,
      ignoreExpiration: false,
    });
  }
  async validate(payload: JwtPayload) {
    const session = await this.sessionsService.findByJti(payload.jti);

    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    return { userId: payload.sub, role: payload.role, jti: payload.jti };
  }
}
