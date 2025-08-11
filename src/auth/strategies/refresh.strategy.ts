import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      secretOrKey: config.get<string>('app.jwtRefresh.secret'),
      passReqToCallback: true,
    });
  }

  validate(payload: any) {
    return payload;
  }
}
