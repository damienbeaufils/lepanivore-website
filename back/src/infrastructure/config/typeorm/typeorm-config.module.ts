import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ClosingPeriodEntity } from '../../repositories/entities/closing-period.entity';
import { FeatureEntity } from '../../repositories/entities/feature.entity';
import { OrderEntity } from '../../repositories/entities/order.entity';
import { ProductEntity } from '../../repositories/entities/product.entity';
import { EnvironmentConfigModule } from '../environment-config/environment-config.module';
import { EnvironmentConfigService } from '../environment-config/environment-config.service';

export const getTypeOrmModuleOptions = (environmentConfigService: EnvironmentConfigService): TypeOrmModuleOptions =>
  ({
    type: environmentConfigService.get('DATABASE_TYPE'),
    host: environmentConfigService.get('DATABASE_HOST'),
    port: parseInt(environmentConfigService.get('DATABASE_PORT'), 10),
    username: environmentConfigService.get('DATABASE_USERNAME'),
    password: environmentConfigService.get('DATABASE_PASSWORD'),
    database: environmentConfigService.get('DATABASE_NAME'),
    entities: [OrderEntity, ProductEntity, ClosingPeriodEntity, FeatureEntity],
    ssl: {
      rejectUnauthorized: false,
    },
    synchronize: false,
  } as TypeOrmModuleOptions);

export const getTypeOrmMigrationsOptions = (environmentConfigService: EnvironmentConfigService) => ({
  ...getTypeOrmModuleOptions(environmentConfigService),
  entities: ['dist/**/entities/*.entity{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  migrations: ['**/migrations/*migration*.ts'],
  name: 'schema',
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvironmentConfigModule],
      inject: [EnvironmentConfigService],
      useFactory: getTypeOrmModuleOptions,
    }),
  ],
})
export class TypeOrmConfigModule {}
