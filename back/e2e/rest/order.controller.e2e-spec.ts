import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { ProductOrderingDisabledError } from '../../src/domain/feature/errors/product-ordering-disabled.error';
import { DeleteOrderCommand } from '../../src/domain/order/commands/delete-order-command';
import { NewOrderCommand } from '../../src/domain/order/commands/new-order-command';
import { UpdateOrderCommand } from '../../src/domain/order/commands/update-order-command';
import { InvalidOrderError } from '../../src/domain/order/errors/invalid-order.error';
import { OrderNotFoundError } from '../../src/domain/order/errors/order-not-found.error';
import { Order } from '../../src/domain/order/order';
import { OrderType } from '../../src/domain/order/order-type';
import { OrderId } from '../../src/domain/type-aliases';
import { ADMIN } from '../../src/domain/user/user';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { PostOrderRequest } from '../../src/infrastructure/rest/models/post-order-request';
import { PutOrderRequest } from '../../src/infrastructure/rest/models/put-order-request';
import { RestModule } from '../../src/infrastructure/rest/rest.module';
import { ProxyServicesDynamicModule } from '../../src/infrastructure/use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../../src/infrastructure/use_cases_proxy/use-case-proxy';
import { DeleteOrder } from '../../src/use_cases/delete-order';
import { GetOrders } from '../../src/use_cases/get-orders';
import { OrderProducts } from '../../src/use_cases/order-products';
import { UpdateExistingOrder } from '../../src/use_cases/update-existing-order';
import { ADMIN_E2E_PASSWORD, ADMIN_E2E_USERNAME, e2eEnvironmentConfigService } from '../e2e-config';
import DoneCallback = jest.DoneCallback;

describe('infrastructure/rest/OrderController (e2e)', () => {
  let app: INestApplication;
  let mockGetOrders: GetOrders;
  let mockOrderProducts: OrderProducts;
  let mockUpdateExistingOrder: UpdateExistingOrder;
  let mockDeleteOrder: DeleteOrder;

  beforeAll(async () => {
    mockGetOrders = {} as GetOrders;
    mockGetOrders.execute = jest.fn();
    const mockGetOrdersProxyService: UseCaseProxy<GetOrders> = {
      getInstance: () => mockGetOrders,
    } as UseCaseProxy<GetOrders>;

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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestModule],
    })
      .overrideProvider(ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE)
      .useValue(mockGetOrdersProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE)
      .useValue(mockOrderProductsProxyService)
      .overrideProvider(ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE)
      .useValue(mockUpdateExistingOrderProxyService)
      .overrideProvider(ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE)
      .useValue(mockDeleteOrderProxyService)
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
        } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
          pickUpDate: new Date('2020-08-15T12:00:00Z'),
          deliveryDate: new Date('2030-08-15T12:00:00Z'),
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
                { id: 1, clientName: 'fake order 1', pickUpDate: '2020-07-01', deliveryDate: '2030-07-01' },
                { id: 2, clientName: 'fake order 2', pickUpDate: '2020-08-15', deliveryDate: '2030-08-15' },
              ]);
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
          pickUpDate: new Date('2020-07-01T12:00:00Z'),
          deliveryDate: new Date('2030-07-01T12:00:00Z'),
        } as Order,
        {
          id: 2,
          clientName: 'fake order 2',
          products: [
            { product: { id: 3, name: 'product 3', description: 'product 3 description', price: 3.33 }, quantity: 3 },
            { product: { id: 4, name: 'product 4', description: 'product 4 description', price: 4.44 }, quantity: 4 },
          ],
          pickUpDate: new Date('2020-08-15T12:00:00Z'),
          deliveryDate: new Date('2030-08-15T12:00:00Z'),
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
                '"orderId","clientName","clientPhoneNumber","clientEmailAddress","product","quantity","type","pickUpDate","deliveryDate","deliveryAddress","note"\n' +
                  '1,"fake order 1",,,"product 1",1,"Cueillette","2020-07-01","2030-07-01",,\n' +
                  '1,"fake order 1",,,"product 2",2,"Cueillette","2020-07-01","2030-07-01",,\n' +
                  '2,"fake order 2",,,"product 3",3,"Cueillette","2020-08-15","2030-08-15",,\n' +
                  '2,"fake order 2",,,"product 4",4,"Cueillette","2020-08-15","2030-08-15",,'
              );
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
    it('should create order using body request transformed to command', () => {
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
        note: 'a note',
      };

      // when
      const testRequest: request.Test = request(app.getHttpServer()).post('/api/orders').send(postOrderRequest);

      // then
      return testRequest.expect(201).expect((response: Response) => {
        expect(mockOrderProducts.execute).toHaveBeenCalledWith({
          clientName: 'John Doe',
          clientPhoneNumber: '514-123-4567',
          clientEmailAddress: 'test@example.org',
          products: [{ productId: 42, quantity: 1 }],
          type: OrderType.DELIVERY,
          pickUpDate: new Date('2020-06-13T04:41:20'),
          deliveryAddress: 'Montréal',
          deliveryDate: new Date('2021-03-28T16:35:49'),
          note: 'a note',
        } as NewOrderCommand);
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

  describe('PUT /api/orders', () => {
    it('should update order using id in path and body request transformed to command', (done: DoneCallback) => {
      // given
      const putOrderRequest: PutOrderRequest = {
        products: [{ productId: 42, quantity: 1 }],
        type: 'DELIVERY',
        pickUpDate: '2020-06-13T04:41:20',
        deliveryAddress: 'Montréal',
        deliveryDate: '2021-03-28T16:35:49',
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
              expect(mockUpdateExistingOrder.execute).toHaveBeenCalledWith(ADMIN, {
                orderId: 1337,
                products: [{ productId: 42, quantity: 1 }],
                type: OrderType.DELIVERY,
                pickUpDate: new Date('2020-06-13T04:41:20'),
                deliveryAddress: 'Montréal',
                deliveryDate: new Date('2021-03-28T16:35:49'),
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

  describe('DELETE /api/orders', () => {
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
              expect(mockDeleteOrder.execute).toHaveBeenCalledWith(ADMIN, { orderId: 1337 } as DeleteOrderCommand);
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
