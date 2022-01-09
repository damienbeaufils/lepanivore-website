import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { ProductOrderingDisabledError } from '../../src/domain/feature/errors/product-ordering-disabled.error';
import { CheckOrderCommand } from '../../src/domain/order/commands/check-order-command';
import { DeleteOrderCommand } from '../../src/domain/order/commands/delete-order-command';
import { NewOrderCommand } from '../../src/domain/order/commands/new-order-command';
import { UncheckOrderCommand } from '../../src/domain/order/commands/uncheck-order-command';
import { UpdateOrderCommand } from '../../src/domain/order/commands/update-order-command';
import { InvalidOrderError } from '../../src/domain/order/errors/invalid-order.error';
import { OrderNotFoundError } from '../../src/domain/order/errors/order-not-found.error';
import { Order } from '../../src/domain/order/order';
import { OrderType } from '../../src/domain/order/order-type';
import { OrderId } from '../../src/domain/type-aliases';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { PostOrderRequest } from '../../src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../src/infrastructure/rest/models/put-order-request';
import { RestModule } from '../../src/infrastructure/rest/rest.module';
import { ProxyServicesDynamicModule } from '../../src/infrastructure/use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../../src/infrastructure/use_cases_proxy/use-case-proxy';
import { CheckOrder } from '../../src/use_cases/check-order';
import { DeleteOrder } from '../../src/use_cases/delete-order';
import { GetOrders } from '../../src/use_cases/get-orders';
import { GetOrdersByDate } from '../../src/use_cases/get-orders-by-date';
import { OrderProducts } from '../../src/use_cases/order-products';
import { UncheckOrder } from '../../src/use_cases/uncheck-order';
import { UpdateExistingOrder } from '../../src/use_cases/update-existing-order';
import { ADMIN_E2E_PASSWORD, ADMIN_E2E_USERNAME, e2eEnvironmentConfigService } from '../e2e-config';
import DoneCallback = jest.DoneCallback;
import { GetOrderedProductsByDateRange } from '../../src/use_cases/get-ordered-products-by-date-range';
import { OrderedProductInterface } from '../../src/domain/order/ordered-product.interface';

describe('infrastructure/rest/OrderController (e2e)', () => {
  let app: INestApplication;
  let mockGetOrders: GetOrders;
  let mockGetOrdersByDate: GetOrdersByDate;
  let mockGetOrderedProductsByDateRange: GetOrderedProductsByDateRange;
  let mockOrderProducts: OrderProducts;
  let mockUpdateExistingOrder: UpdateExistingOrder;
  let mockDeleteOrder: DeleteOrder;
  let mockCheckOrder: CheckOrder;
  let mockUncheckOrder: UncheckOrder;

  beforeAll(async () => {
    mockGetOrders = {} as GetOrders;
    mockGetOrders.execute = jest.fn();
    const mockGetOrdersProxyService: UseCaseProxy<GetOrders> = {
      getInstance: () => mockGetOrders,
    } as UseCaseProxy<GetOrders>;

    mockGetOrdersByDate = {} as GetOrdersByDate;
    mockGetOrdersByDate.execute = jest.fn();
    const mockGetOrdersByDateProxyService: UseCaseProxy<GetOrdersByDate> = {
      getInstance: () => mockGetOrdersByDate,
    } as UseCaseProxy<GetOrdersByDate>;

    mockGetOrderedProductsByDateRange = {} as GetOrderedProductsByDateRange;
    mockGetOrderedProductsByDateRange.execute = jest.fn();
    const mockGetOrderedProductsByDateRangeProxyService: UseCaseProxy<GetOrderedProductsByDateRange> = {
      getInstance: () => mockGetOrderedProductsByDateRange,
    } as UseCaseProxy<GetOrderedProductsByDateRange>;

    mockOrderProducts = {} as OrderProducts;
    mockOrderProducts.execute = jest.fn();
    const mockOrderProductsProxyService: UseCaseProxy<OrderProducts> = {
      getInstance: () => mockOrderProducts,
    } as UseCaseProxy<OrderProducts>;

    mockUpdateExistingOrder = {} as UpdateExistingOrder;
    mockUpdateExistingOrder.execute = jest.fn();
    const mockUpdateExistingOrderProxyService: UseCaseProxy<UpdateExistingOrder> = {
      getInstance: () => mockUpdateExistingOrder,
    } as UseCaseProxy<UpdateExistingOrder>;

    mockDeleteOrder = {} as DeleteOrder;
    mockDeleteOrder.execute = jest.fn();
    const mockDeleteOrderProxyService: UseCaseProxy<DeleteOrder> = {
      getInstance: () => mockDeleteOrder,
    } as UseCaseProxy<DeleteOrder>;

    mockCheckOrder = {} as CheckOrder;
    mockCheckOrder.execute = jest.fn();
    const mockCheckOrderProxyService: UseCaseProxy<CheckOrder> = {
      getInstance: () => mockCheckOrder,
    } as UseCaseProxy<CheckOrder>;

    mockUncheckOrder = {} as UncheckOrder;
    mockUncheckOrder.execute = jest.fn();
    const mockUncheckOrderProxyService: UseCaseProxy<UncheckOrder> = {
      getInstance: () => mockUncheckOrder,
    } as UseCaseProxy<UncheckOrder>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestModule],
    })
      .overrideProvider(ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE)
      .useValue(mockGetOrdersProxyService)
      .overrideProvider(ProxyServicesDynamicModule.GET_ORDERS_BY_DATE_PROXY_SERVICE)
      .useValue(mockGetOrdersByDateProxyService)
      .overrideProvider(ProxyServicesDynamicModule.GET_ORDERED_PRODUCTS_BY_DATE_RANGE_PROXY_SERVICE)
      .useValue(mockGetOrderedProductsByDateRangeProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE)
      .useValue(mockOrderProductsProxyService)
      .overrideProvider(ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE)
      .useValue(mockUpdateExistingOrderProxyService)
      .overrideProvider(ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE)
      .useValue(mockDeleteOrderProxyService)
      .overrideProvider(ProxyServicesDynamicModule.CHECK_ORDERED_PRODUCT_PROXY_SERVICE)
      .useValue(mockCheckOrderProxyService)
      .overrideProvider(ProxyServicesDynamicModule.UNCHECK_ORDERED_PRODUCT_PROXY_SERVICE)
      .useValue(mockUncheckOrderProxyService)
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    (mockGetOrders.execute as jest.Mock).mockClear();
    (mockGetOrdersByDate.execute as jest.Mock).mockClear();
    (mockGetOrderedProductsByDateRange.execute as jest.Mock).mockClear();
    (mockOrderProducts.execute as jest.Mock).mockClear();
    (mockUpdateExistingOrder.execute as jest.Mock).mockClear();
    (mockDeleteOrder.execute as jest.Mock).mockClear();
    (mockCheckOrder.execute as jest.Mock).mockClear();
    (mockUncheckOrder.execute as jest.Mock).mockClear();
  });

  describe('GET /api/orders', () => {
    it('should return http status code OK with found orders when authenticated as admin', (done: DoneCallback) => {
      // given
      const orders: Order[] = [
        {
          id: 1,
          clientName: 'fake order 1',
          pickUpDate: new Date('2020-07-01T12:00:00Z'),
          deliveryDate: new Date('2030-07-01T12:00:00Z'),
          reservationDate: new Date('2040-07-01T12:00:00Z'),
        } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
          pickUpDate: new Date('2020-08-15T12:00:00Z'),
          deliveryDate: new Date('2030-08-15T12:00:00Z'),
          reservationDate: new Date('2040-08-15T12:00:00Z'),
        } as Order,
      ];
      (mockGetOrders.execute as jest.Mock).mockReturnValue(Promise.resolve(orders));

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(response.body).toStrictEqual([
                { id: 1, clientName: 'fake order 1', pickUpDate: '2020-07-01', deliveryDate: '2030-07-01', reservationDate: '2040-07-01' },
                { id: 2, clientName: 'fake order 2', pickUpDate: '2020-08-15', deliveryDate: '2030-08-15', reservationDate: '2040-08-15' },
              ]);
            })
            .end(done);
        });
    });

    it('should call use case with year when defined in query param', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders')
            .query({ year: '2021' })
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockGetOrders.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, 2021);
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).get('/api/orders');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('GET /api/orders/date', () => {
    it('should return http status code OK with found orders when authenticated as admin', (done: DoneCallback) => {
      // given
      const orders: Order[] = [
        {
          id: 1,
          clientName: 'fake order 1',
          pickUpDate: new Date('2021-03-28T12:00:00Z'),
          deliveryDate: new Date('2021-03-28T12:00:00Z'),
          reservationDate: new Date('2021-03-28T12:00:00Z'),
        } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
          pickUpDate: new Date('2021-03-28T12:00:00Z'),
          deliveryDate: new Date('2021-03-28T12:00:00Z'),
          reservationDate: new Date('2021-03-28T12:00:00Z'),
        } as Order,
      ];
      (mockGetOrdersByDate.execute as jest.Mock).mockReturnValue(Promise.resolve(orders));

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/date/2021-03-28')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(response.body).toStrictEqual([
                { id: 1, clientName: 'fake order 1', pickUpDate: '2021-03-28', deliveryDate: '2021-03-28', reservationDate: '2021-03-28' },
                { id: 2, clientName: 'fake order 2', pickUpDate: '2021-03-28', deliveryDate: '2021-03-28', reservationDate: '2021-03-28' },
              ]);
            })
            .end(done);
        });
    });

    it('should call use case with given date', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/date/2021-03-28')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockGetOrdersByDate.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, new Date('2021-03-28T12:00:00Z'));
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).get('/api/orders/date/2021-03-28');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('GET /api/orders/products/startDate/endDate', () => {
    it('should return http status code OK with found orders when authenticated as admin', (done: DoneCallback) => {
      // given
      const orderedProducts: OrderedProductInterface[] = [
        {
          name: 'product A',
          pickUpCount: 0,
          deliveryCount: 1,
          reservationCount: 2,
          totalCount: 3,
        },
        {
          name: 'product B',
          pickUpCount: 3,
          deliveryCount: 4,
          reservationCount: 0,
          totalCount: 7,
        },
      ];
      (mockGetOrderedProductsByDateRange.execute as jest.Mock).mockReturnValue(Promise.resolve(orderedProducts));

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/products/2021-01-01/2021-12-31')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(response.body).toStrictEqual([
                { name: 'product A', pickUpCount: 0, deliveryCount: 1, reservationCount: 2, totalCount: 3 },
                { name: 'product B', pickUpCount: 3, deliveryCount: 4, reservationCount: 0, totalCount: 7 },
              ]);
            })
            .end(done);
        });
    });

    it('should call use case with start and end dates', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/products/2021-01-01/2021-12-31')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockGetOrderedProductsByDateRange.execute).toHaveBeenCalledWith(
                { username: 'ADMIN' },
                new Date('2021-01-01T12:00:00Z'),
                new Date('2021-12-31T12:00:00Z')
              );
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).get('/api/orders/products/2021-01-01/2021-12-31');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('GET /api/orders/csv', () => {
    it('should return http status code OK with found orders as csv when authenticated as admin', (done: DoneCallback) => {
      // given
      const orders: Order[] = [
        {
          id: 1,
          clientName: 'fake order 1',
          products: [
            { product: { id: 1, name: 'product 1', description: 'product 1 description', price: 1.11 }, quantity: 1 },
            { product: { id: 2, name: 'product 2', description: 'product 2 description', price: 2.22 }, quantity: 2 },
          ],
          type: OrderType.PICK_UP,
          pickUpDate: new Date('2020-07-01T12:00:00Z'),
          deliveryDate: new Date('2030-07-01T12:00:00Z'),
          reservationDate: new Date('2040-07-01T12:00:00Z'),
        } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
          products: [
            { product: { id: 3, name: 'product 3', description: 'product 3 description', price: 3.33 }, quantity: 3 },
            { product: { id: 4, name: 'product 4', description: 'product 4 description', price: 4.44 }, quantity: 4 },
          ],
          type: OrderType.DELIVERY,
          pickUpDate: new Date('2020-08-15T12:00:00Z'),
          deliveryDate: new Date('2030-08-15T12:00:00Z'),
          reservationDate: new Date('2040-08-15T12:00:00Z'),
        } as Order,
      ];
      (mockGetOrders.execute as jest.Mock).mockReturnValue(Promise.resolve(orders));

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/csv')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect('Content-Type', 'text/csv; charset=utf-8')
            .expect((response: Response) => {
              expect(response.text).toBe(
                '"orderId","clientName","clientPhoneNumber","clientEmailAddress","product","quantity","type","pickUpDate","deliveryDate","deliveryAddress","reservationDate","note"\n' +
                  '1,"fake order 1",,,"product 1",1,"Cueillette","2020-07-01","2030-07-01",,"2040-07-01",\n' +
                  '1,"fake order 1",,,"product 2",2,"Cueillette","2020-07-01","2030-07-01",,"2040-07-01",\n' +
                  '2,"fake order 2",,,"product 3",3,"Livraison","2020-08-15","2030-08-15",,"2040-08-15",\n' +
                  '2,"fake order 2",,,"product 4",4,"Livraison","2020-08-15","2030-08-15",,"2040-08-15",'
              );
            })
            .end(done);
        });
    });

    it('should call use case with year when defined in query param', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .get('/api/orders/csv')
            .query({ year: '2021' })
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockGetOrders.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, 2021);
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).get('/api/orders/csv');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order using body request transformed to command when user is anonymous', () => {
      // given
      const postOrderRequest: PostOrderRequest = {
        clientName: 'John Doe',
        clientPhoneNumber: '514-123-4567',
        clientEmailAddress: 'test@example.org',
        products: [{ productId: 42, quantity: 1 }],
        type: 'DELIVERY',
        pickUpDate: '2020-06-13T04:41:20',
        deliveryAddress: 'Montréal',
        deliveryDate: '2021-03-28T16:35:49',
        reservationDate: '2022-11-12T13:27:39',
        note: 'a note',
      };

      // when
      const testRequest: request.Test = request(app.getHttpServer()).post('/api/orders').send(postOrderRequest);

      // then
      return testRequest.expect(201).expect((response: Response) => {
        expect(mockOrderProducts.execute).toHaveBeenCalledWith({ username: 'ANONYMOUS' }, {
          clientName: 'John Doe',
          clientPhoneNumber: '514-123-4567',
          clientEmailAddress: 'test@example.org',
          products: [{ productId: 42, quantity: 1 }],
          type: OrderType.DELIVERY,
          pickUpDate: new Date('2020-06-13T12:00:00Z'),
          deliveryAddress: 'Montréal',
          deliveryDate: new Date('2021-03-28T12:00:00Z'),
          reservationDate: new Date('2022-11-12T12:00:00Z'),
          note: 'a note',
        } as NewOrderCommand);
      });
    });

    it('should create order using body request transformed to command when user is admin', (done: DoneCallback) => {
      // given
      const postOrderRequest: PostOrderRequest = {
        clientName: 'John Doe',
        clientPhoneNumber: '514-123-4567',
        clientEmailAddress: 'test@example.org',
        products: [{ productId: 42, quantity: 1 }],
        type: 'DELIVERY',
        pickUpDate: '2020-06-13T04:41:20',
        deliveryAddress: 'Montréal',
        deliveryDate: '2021-03-28T16:35:49',
        reservationDate: '2022-11-12T13:27:39',
        note: 'a note',
      };

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .post('/api/orders')
            .send(postOrderRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(201)
            .expect((response: Response) => {
              expect(mockOrderProducts.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, {
                clientName: 'John Doe',
                clientPhoneNumber: '514-123-4567',
                clientEmailAddress: 'test@example.org',
                products: [{ productId: 42, quantity: 1 }],
                type: OrderType.DELIVERY,
                pickUpDate: new Date('2020-06-13T12:00:00Z'),
                deliveryAddress: 'Montréal',
                deliveryDate: new Date('2021-03-28T12:00:00Z'),
                reservationDate: new Date('2022-11-12T12:00:00Z'),
                note: 'a note',
              } as NewOrderCommand);
            })
            .end(done);
        });
    });

    it('should return http status code CREATED with created order id and location to it', () => {
      // given
      const orderId: OrderId = 42;
      (mockOrderProducts.execute as jest.Mock).mockReturnValue(Promise.resolve(orderId));

      // when
      const testRequest: request.Test = request(app.getHttpServer())
        .post('/api/orders')
        .send({} as PostOrderRequest);

      // then
      return testRequest.expect(201).expect((response: Response) => {
        expect(response.body).toStrictEqual({ id: orderId });
        expect(response.header.location).toBe('/api/orders/42');
      });
    });

    it('should return http status code BAD REQUEST when invalid order', () => {
      // given
      (mockOrderProducts.execute as jest.Mock).mockImplementation(() => {
        throw new InvalidOrderError('invalid order');
      });

      // when
      const testRequest: request.Test = request(app.getHttpServer())
        .post('/api/orders')
        .send({} as PostOrderRequest);

      // then
      return testRequest.expect(400).expect((response: Response) => {
        expect(response.body).toMatchObject({
          statusCode: 400,
          timestamp: expect.any(String),
          name: 'Error',
          message: 'invalid order',
        });
      });
    });

    it('should return http status code SERVICE UNAVAILABLE when product ordering is disabled', () => {
      // given
      (mockOrderProducts.execute as jest.Mock).mockImplementation(() => {
        throw new ProductOrderingDisabledError('product ordering is disabled');
      });

      // when
      const testRequest: request.Test = request(app.getHttpServer())
        .post('/api/orders')
        .send({} as PostOrderRequest);

      // then
      return testRequest.expect(503).expect((response: Response) => {
        expect(response.body).toMatchObject({
          statusCode: 503,
          timestamp: expect.any(String),
          name: 'Error',
          message: 'product ordering is disabled',
        });
      });
    });
  });

  describe('PUT /api/orders/id', () => {
    it('should update order using id in path and body request transformed to command', (done: DoneCallback) => {
      // given
      const putOrderRequest: PutOrderRequest = {
        products: [{ productId: 42, quantity: 1 }],
        type: 'DELIVERY',
        pickUpDate: '2020-06-13T04:41:20',
        deliveryAddress: 'Montréal',
        deliveryDate: '2021-03-28T16:35:49',
        reservationDate: '2022-11-12T13:27:39',
        note: 'a note',
      };

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337')
            .send(putOrderRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockUpdateExistingOrder.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, {
                orderId: 1337,
                products: [{ productId: 42, quantity: 1 }],
                type: OrderType.DELIVERY,
                pickUpDate: new Date('2020-06-13T12:00:00Z'),
                deliveryAddress: 'Montréal',
                deliveryDate: new Date('2021-03-28T12:00:00Z'),
                reservationDate: new Date('2022-11-12T12:00:00Z'),
                note: 'a note',
              } as UpdateOrderCommand);
            })
            .end(done);
        });
    });

    it('should return http status code BAD REQUEST when invalid order', (done: DoneCallback) => {
      // given
      (mockUpdateExistingOrder.execute as jest.Mock).mockImplementation(() => {
        throw new InvalidOrderError('invalid order');
      });

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337')
            .send({} as PutOrderRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(400)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 400,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'invalid order',
              });
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when order not found', (done: DoneCallback) => {
      // given
      (mockUpdateExistingOrder.execute as jest.Mock).mockImplementation(() => {
        throw new OrderNotFoundError('order not found');
      });

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337')
            .send({} as PutOrderRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'order not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer())
        .put('/api/orders/1337')
        .send({} as PutOrderRequest);

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('PUT /api/orders/id/check', () => {
    it('should check order using id in path transformed to command', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337/check')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockCheckOrder.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, { orderId: 1337 } as CheckOrderCommand);
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when order not found', (done: DoneCallback) => {
      // given
      (mockCheckOrder.execute as jest.Mock).mockImplementation(() => {
        throw new OrderNotFoundError('order not found');
      });

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337/check')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'order not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).put('/api/orders/1337/check');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('PUT /api/orders/id/uncheck', () => {
    it('should check order using id in path transformed to command', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337/uncheck')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockUncheckOrder.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, { orderId: 1337 } as CheckOrderCommand);
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when order not found', (done: DoneCallback) => {
      // given
      (mockUncheckOrder.execute as jest.Mock).mockImplementation(() => {
        throw new OrderNotFoundError('order not found');
      });

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .put('/api/orders/1337/uncheck')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'order not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).put('/api/orders/1337/uncheck');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('DELETE /api/orders/id', () => {
    it('should delete order using id in path transformed to command', (done: DoneCallback) => {
      // given
      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .delete('/api/orders/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(204)
            .expect((response: Response) => {
              expect(mockDeleteOrder.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, { orderId: 1337 } as DeleteOrderCommand);
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when order not found', (done: DoneCallback) => {
      // given
      (mockDeleteOrder.execute as jest.Mock).mockImplementation(() => {
        throw new OrderNotFoundError('order not found');
      });

      const loginRequest: request.Test = request(app.getHttpServer()).post('/api/authentication/login').send({
        username: ADMIN_E2E_USERNAME,
        password: ADMIN_E2E_PASSWORD,
      });

      let accessToken: string;
      loginRequest
        .expect(200)
        .expect((loginResponse: Response) => {
          accessToken = loginResponse.body.accessToken;
        })
        .end(() => {
          // when
          const testRequest: request.Test = request(app.getHttpServer())
            .delete('/api/orders/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'order not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).delete('/api/orders/1337');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
