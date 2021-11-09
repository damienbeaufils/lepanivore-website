import { DynamicModule, Module } from '@nestjs/common';
import { AddNewClosingPeriod } from '../../use_cases/add-new-closing-period';
import { AddNewProduct } from '../../use_cases/add-new-product';
import { ArchiveProduct } from '../../use_cases/archive-product';
import { DeleteClosingPeriod } from '../../use_cases/delete-closing-period';
import { DeleteOrder } from '../../use_cases/delete-order';
import { DisableProductOrdering } from '../../use_cases/disable-product-ordering';
import { EnableProductOrdering } from '../../use_cases/enable-product-ordering';
import { GetActiveProducts } from '../../use_cases/get-active-products';
import { GetClosingPeriods } from '../../use_cases/get-closing-periods';
import { GetOrders } from '../../use_cases/get-orders';
import { GetProductOrderingStatus } from '../../use_cases/get-product-ordering-status';
import { OrderProducts } from '../../use_cases/order-products';
import { UpdateExistingOrder } from '../../use_cases/update-existing-order';
import { UpdateExistingProduct } from '../../use_cases/update-existing-product';
import { DatabaseClosingPeriodRepository } from '../repositories/database-closing-period.repository';
import { DatabaseFeatureRepository } from '../repositories/database-feature.repository';
import { DatabaseOrderRepository } from '../repositories/database-order.repository';
import { DatabaseProductRepository } from '../repositories/database-product.repository';
import { EmailOrderNotificationRepository } from '../repositories/email-order-notification.repository';
import { RepositoriesModule } from '../repositories/repositories.module';
import { UseCaseProxy } from './use-case-proxy';
import { GetOrderedProductsByDateRange } from '../../use_cases/get-ordered-products-by-date-range';

@Module({
  imports: [RepositoriesModule],
})
export class ProxyServicesDynamicModule {
  // Order
  static GET_ORDERS_PROXY_SERVICE: string = 'GetOrdersProxyService';
  static GET_ORDERED_PRODUCTS_BY_DATE_RANGE_PROXY_SERVICE: string = 'GetOrderedProductsByDateRangeProxyService';
  static ORDER_PRODUCTS_PROXY_SERVICE: string = 'OrderProductsProxyService';
  static UPDATE_EXISTING_ORDER_PROXY_SERVICE: string = 'UpdateExistingOrderProxyService';
  static DELETE_ORDER_PROXY_SERVICE: string = 'DeleteOrderProxyService';
  // Product
  static GET_ACTIVE_PRODUCTS_PROXY_SERVICE: string = 'GetActiveProductsProxyService';
  static ADD_NEW_PRODUCT_PROXY_SERVICE: string = 'AddNewProductProxyService';
  static UPDATE_EXISTING_PRODUCT_PROXY_SERVICE: string = 'UpdateExistingProductProxyService';
  static ARCHIVE_PRODUCT_PROXY_SERVICE: string = 'ArchiveProductProxyService';
  // Closing period
  static GET_CLOSING_PERIODS_PROXY_SERVICE: string = 'GetClosingPeriodsProxyService';
  static ADD_NEW_CLOSING_PERIOD_PROXY_SERVICE: string = 'AddNewClosingPeriodProxyService';
  static DELETE_CLOSING_PERIOD_PROXY_SERVICE: string = 'DeleteClosingPeriodProxyService';
  // Feature
  static GET_PRODUCT_ORDERING_STATUS_PROXY_SERVICE: string = 'GetProductOrderingStatusProxyService';
  static ENABLE_PRODUCT_ORDERING_PROXY_SERVICE: string = 'EnableProductOrderingProxyService';
  static DISABLE_PRODUCT_ORDERING_PROXY_SERVICE: string = 'DisableProductOrderingProxyService';

  static register(): DynamicModule {
    return {
      module: ProxyServicesDynamicModule,
      providers: [
        // Order
        {
          inject: [DatabaseOrderRepository],
          provide: ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE,
          useFactory: (databaseOrderRepository: DatabaseOrderRepository) => new UseCaseProxy(new GetOrders(databaseOrderRepository)),
        },
        {
          inject: [DatabaseOrderRepository],
          provide: ProxyServicesDynamicModule.GET_ORDERED_PRODUCTS_BY_DATE_RANGE_PROXY_SERVICE,
          useFactory: (databaseOrderRepository: DatabaseOrderRepository) =>
            new UseCaseProxy(new GetOrderedProductsByDateRange(databaseOrderRepository)),
        },
        {
          inject: [
            DatabaseProductRepository,
            DatabaseClosingPeriodRepository,
            DatabaseOrderRepository,
            EmailOrderNotificationRepository,
            DatabaseFeatureRepository,
          ],
          provide: ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE,
          useFactory: (
            databaseProductRepository: DatabaseProductRepository,
            databaseClosingPeriodRepository: DatabaseClosingPeriodRepository,
            databaseOrderRepository: DatabaseOrderRepository,
            emailOrderNotificationRepository: EmailOrderNotificationRepository,
            databaseFeatureRepository: DatabaseFeatureRepository
          ) =>
            new UseCaseProxy(
              new OrderProducts(
                databaseProductRepository,
                databaseClosingPeriodRepository,
                databaseOrderRepository,
                emailOrderNotificationRepository,
                databaseFeatureRepository
              )
            ),
        },
        {
          inject: [DatabaseProductRepository, DatabaseClosingPeriodRepository, DatabaseOrderRepository],
          provide: ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE,
          useFactory: (
            databaseProductRepository: DatabaseProductRepository,
            databaseClosingPeriodRepository: DatabaseClosingPeriodRepository,
            databaseOrderRepository: DatabaseOrderRepository
          ) => new UseCaseProxy(new UpdateExistingOrder(databaseProductRepository, databaseClosingPeriodRepository, databaseOrderRepository)),
        },
        {
          inject: [DatabaseOrderRepository],
          provide: ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE,
          useFactory: (databaseOrderRepository: DatabaseOrderRepository) => new UseCaseProxy(new DeleteOrder(databaseOrderRepository)),
        },
        // Product
        {
          inject: [DatabaseProductRepository],
          provide: ProxyServicesDynamicModule.GET_ACTIVE_PRODUCTS_PROXY_SERVICE,
          useFactory: (databaseProductRepository: DatabaseProductRepository) => new UseCaseProxy(new GetActiveProducts(databaseProductRepository)),
        },
        {
          inject: [DatabaseProductRepository],
          provide: ProxyServicesDynamicModule.ADD_NEW_PRODUCT_PROXY_SERVICE,
          useFactory: (databaseProductRepository: DatabaseProductRepository) => new UseCaseProxy(new AddNewProduct(databaseProductRepository)),
        },
        {
          inject: [DatabaseProductRepository],
          provide: ProxyServicesDynamicModule.UPDATE_EXISTING_PRODUCT_PROXY_SERVICE,
          useFactory: (databaseProductRepository: DatabaseProductRepository) =>
            new UseCaseProxy(new UpdateExistingProduct(databaseProductRepository)),
        },
        {
          inject: [DatabaseProductRepository],
          provide: ProxyServicesDynamicModule.ARCHIVE_PRODUCT_PROXY_SERVICE,
          useFactory: (databaseProductRepository: DatabaseProductRepository) => new UseCaseProxy(new ArchiveProduct(databaseProductRepository)),
        },
        // Closing period
        {
          inject: [DatabaseClosingPeriodRepository],
          provide: ProxyServicesDynamicModule.GET_CLOSING_PERIODS_PROXY_SERVICE,
          useFactory: (databaseClosingPeriodRepository: DatabaseClosingPeriodRepository) =>
            new UseCaseProxy(new GetClosingPeriods(databaseClosingPeriodRepository)),
        },
        {
          inject: [DatabaseClosingPeriodRepository],
          provide: ProxyServicesDynamicModule.ADD_NEW_CLOSING_PERIOD_PROXY_SERVICE,
          useFactory: (databaseClosingPeriodRepository: DatabaseClosingPeriodRepository) =>
            new UseCaseProxy(new AddNewClosingPeriod(databaseClosingPeriodRepository)),
        },
        {
          inject: [DatabaseClosingPeriodRepository],
          provide: ProxyServicesDynamicModule.DELETE_CLOSING_PERIOD_PROXY_SERVICE,
          useFactory: (databaseClosingPeriodRepository: DatabaseClosingPeriodRepository) =>
            new UseCaseProxy(new DeleteClosingPeriod(databaseClosingPeriodRepository)),
        },
        // Feature
        {
          inject: [DatabaseFeatureRepository],
          provide: ProxyServicesDynamicModule.GET_PRODUCT_ORDERING_STATUS_PROXY_SERVICE,
          useFactory: (databaseFeatureRepository: DatabaseFeatureRepository) =>
            new UseCaseProxy(new GetProductOrderingStatus(databaseFeatureRepository)),
        },
        {
          inject: [DatabaseFeatureRepository],
          provide: ProxyServicesDynamicModule.ENABLE_PRODUCT_ORDERING_PROXY_SERVICE,
          useFactory: (databaseFeatureRepository: DatabaseFeatureRepository) =>
            new UseCaseProxy(new EnableProductOrdering(databaseFeatureRepository)),
        },
        {
          inject: [DatabaseFeatureRepository],
          provide: ProxyServicesDynamicModule.DISABLE_PRODUCT_ORDERING_PROXY_SERVICE,
          useFactory: (databaseFeatureRepository: DatabaseFeatureRepository) =>
            new UseCaseProxy(new DisableProductOrdering(databaseFeatureRepository)),
        },
      ],
      exports: [
        // Order
        ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE,
        ProxyServicesDynamicModule.GET_ORDERED_PRODUCTS_BY_DATE_RANGE_PROXY_SERVICE,
        ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE,
        ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE,
        ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE,
        // Product
        ProxyServicesDynamicModule.GET_ACTIVE_PRODUCTS_PROXY_SERVICE,
        ProxyServicesDynamicModule.ADD_NEW_PRODUCT_PROXY_SERVICE,
        ProxyServicesDynamicModule.UPDATE_EXISTING_PRODUCT_PROXY_SERVICE,
        ProxyServicesDynamicModule.ARCHIVE_PRODUCT_PROXY_SERVICE,
        // Closing period
        ProxyServicesDynamicModule.GET_CLOSING_PERIODS_PROXY_SERVICE,
        ProxyServicesDynamicModule.ADD_NEW_CLOSING_PERIOD_PROXY_SERVICE,
        ProxyServicesDynamicModule.DELETE_CLOSING_PERIOD_PROXY_SERVICE,
        // Feature
        ProxyServicesDynamicModule.GET_PRODUCT_ORDERING_STATUS_PROXY_SERVICE,
        ProxyServicesDynamicModule.ENABLE_PRODUCT_ORDERING_PROXY_SERVICE,
        ProxyServicesDynamicModule.DISABLE_PRODUCT_ORDERING_PROXY_SERVICE,
      ],
    };
  }
}
