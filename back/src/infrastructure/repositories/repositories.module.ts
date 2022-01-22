import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionModule } from '../config/encryption/encryption.module';
import { EnvironmentConfigModule } from '../config/environment-config/environment-config.module';
import { MailerConfigModule } from '../config/mailer/mailer-config.module';
import { TypeOrmConfigModule } from '../config/typeorm/typeorm-config.module';
import { DatabaseClosingPeriodRepository } from './database-closing-period.repository';
import { DatabaseFeatureRepository } from './database-feature.repository';
import { DatabaseOrderRepository } from './database-order.repository';
import { DatabaseProductRepository } from './database-product.repository';
import { EmailOrderNotificationRepository } from './email-order-notification.repository';
import { ClosingPeriodEntityTransformer } from './entities/closing-period-entity.transformer';
import { ClosingPeriodEntity } from './entities/closing-period.entity';
import { FeatureEntityTransformer } from './entities/feature-entity.transformer';
import { FeatureEntity } from './entities/feature.entity';
import { OrderEntityTransformer } from './entities/order-entity.transformer';
import { OrderEntity } from './entities/order.entity';
import { ProductEntityTransformer } from './entities/product-entity.transformer';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmConfigModule,
    TypeOrmModule.forFeature([OrderEntity, ProductEntity, ClosingPeriodEntity, FeatureEntity]),
    EnvironmentConfigModule,
    MailerConfigModule,
    EncryptionModule,
  ],
  providers: [
    DatabaseOrderRepository,
    DatabaseProductRepository,
    DatabaseClosingPeriodRepository,
    DatabaseFeatureRepository,
    OrderEntityTransformer,
    ProductEntityTransformer,
    FeatureEntityTransformer,
    ClosingPeriodEntityTransformer,
    EmailOrderNotificationRepository,
  ],
  exports: [
    DatabaseOrderRepository,
    DatabaseProductRepository,
    DatabaseClosingPeriodRepository,
    DatabaseFeatureRepository,
    EmailOrderNotificationRepository,
  ],
})
export class RepositoriesModule {}
