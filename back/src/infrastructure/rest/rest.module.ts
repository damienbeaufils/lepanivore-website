import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { AuthenticationModule } from '../config/authentication/authentication.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { AuthenticationController } from './authentication.controller';
import { ClosingPeriodController } from './closing-period.controller';
import { EncryptionController } from './encryption.controller';
import { InvalidItemErrorFilter } from './filters/invalid-item-error.filter';
import { InvalidUserErrorFilter } from './filters/invalid-user-error.filter';
import { ItemNotFoundErrorFilter } from './filters/item-not-found-error.filter';
import { ProductOrderingDisabledErrorFilter } from './filters/product-ordering-disabled-error.filter';
import { OrderController } from './order.controller';
import { ProductOrderingController } from './product-ordering.controller';
import { ProductController } from './product.controller';

@Module({
  imports: [
    ProxyServicesDynamicModule.register(),
    AuthenticationModule,
    RavenModule,
    RepositoriesModule, // TODO REMOVE ME WHEN ALL PERSONAL DATA ARE ENCRYPTED
  ],
  controllers: [
    OrderController,
    ClosingPeriodController,
    ProductController,
    AuthenticationController,
    ClosingPeriodController,
    ProductOrderingController,
    EncryptionController,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useValue: new RavenInterceptor() },
    { provide: APP_FILTER, useClass: InvalidItemErrorFilter },
    { provide: APP_FILTER, useClass: ItemNotFoundErrorFilter },
    { provide: APP_FILTER, useClass: ProductOrderingDisabledErrorFilter },
    { provide: APP_FILTER, useClass: InvalidUserErrorFilter },
  ],
})
export class RestModule {}
