import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt-strategy';
import { LocalStrategy } from './local-strategy';

@Module({
  imports: [
    EnvironmentConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: (environmentConfigService: EnvironmentConfigService) => ({
        secret: environmentConfigService.get('APP_JWT_SECRET'),
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
