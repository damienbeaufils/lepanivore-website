import { Injectable, Logger, LoggerService, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ADMIN, User } from '../../../domain/user/user';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly LOGGER: LoggerService = new Logger(JwtStrategy.name);

  constructor(private readonly environmentConfigService: EnvironmentConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environmentConfigService.get('APP_JWT_SECRET'),
    });
  }

  async validate(payload: User): Promise<User> {
    if (payload.username !== ADMIN.username) {
      this.LOGGER.error(`Username in payload ${payload.username} does not match expected ADMIN username`);

      return Promise.reject(new UnauthorizedException('Username in payload does not match expected ADMIN username'));
    }

    return ADMIN;
  }
}
