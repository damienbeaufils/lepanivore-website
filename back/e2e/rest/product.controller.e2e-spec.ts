import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { ArchiveProductCommand } from '../../src/domain/product/commands/archive-product-command';
import { NewProductCommand } from '../../src/domain/product/commands/new-product-command';
import { UpdateProductCommand } from '../../src/domain/product/commands/update-product-command';
import { InvalidProductError } from '../../src/domain/product/errors/invalid-product.error';
import { ProductNotFoundError } from '../../src/domain/product/errors/product-not-found.error';
import { Product } from '../../src/domain/product/product';
import { ProductId } from '../../src/domain/type-aliases';
import { ADMIN } from '../../src/domain/user/user';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { GetProductResponse } from '../../src/infrastructure/rest/models/get-product-response';
import { PostProductRequest } from '../../src/infrastructure/rest/models/post-product-request';
import { PutProductRequest } from '../../src/infrastructure/rest/models/put-product-request';
import { RestModule } from '../../src/infrastructure/rest/rest.module';
import { ProxyServicesDynamicModule } from '../../src/infrastructure/use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../../src/infrastructure/use_cases_proxy/use-case-proxy';
import { AddNewProduct } from '../../src/use_cases/add-new-product';
import { ArchiveProduct } from '../../src/use_cases/archive-product';
import { GetActiveProducts } from '../../src/use_cases/get-active-products';
import { UpdateExistingProduct } from '../../src/use_cases/update-existing-product';
import { ADMIN_E2E_PASSWORD, ADMIN_E2E_USERNAME, e2eEnvironmentConfigService } from '../e2e-config';
import DoneCallback = jest.DoneCallback;

describe('infrastructure/rest/ProductController (e2e)', () => {
  let app: INestApplication;
  let mockGetActiveProducts: GetActiveProducts;
  let mockAddNewProduct: AddNewProduct;
  let mockUpdateExistingProduct: UpdateExistingProduct;
  let mockArchiveProduct: ArchiveProduct;

  beforeAll(async () => {
    mockGetActiveProducts = {} as GetActiveProducts;
    mockGetActiveProducts.execute = jest.fn();
    const mockGetActiveProductsProxyService: UseCaseProxy<GetActiveProducts> = {
      getInstance: () => mockGetActiveProducts,
    } as UseCaseProxy<GetActiveProducts>;

    mockAddNewProduct = {} as AddNewProduct;
    mockAddNewProduct.execute = jest.fn();
    const mockAddNewProductProxyService: UseCaseProxy<AddNewProduct> = {
      getInstance: () => mockAddNewProduct,
    } as UseCaseProxy<AddNewProduct>;

    mockUpdateExistingProduct = {} as UpdateExistingProduct;
    mockUpdateExistingProduct.execute = jest.fn();
    const mockUpdateExistingProductProxyService: UseCaseProxy<UpdateExistingProduct> = {
      getInstance: () => mockUpdateExistingProduct,
    } as UseCaseProxy<UpdateExistingProduct>;

    mockArchiveProduct = {} as ArchiveProduct;
    mockArchiveProduct.execute = jest.fn();
    const mockArchiveProductProxyService: UseCaseProxy<ArchiveProduct> = {
      getInstance: () => mockArchiveProduct,
    } as UseCaseProxy<ArchiveProduct>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestModule],
    })
      .overrideProvider(ProxyServicesDynamicModule.GET_ACTIVE_PRODUCTS_PROXY_SERVICE)
      .useValue(mockGetActiveProductsProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ADD_NEW_PRODUCT_PROXY_SERVICE)
      .useValue(mockAddNewProductProxyService)
      .overrideProvider(ProxyServicesDynamicModule.UPDATE_EXISTING_PRODUCT_PROXY_SERVICE)
      .useValue(mockUpdateExistingProductProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ARCHIVE_PRODUCT_PROXY_SERVICE)
      .useValue(mockArchiveProductProxyService)
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /api/products', () => {
    it('should return http status code OK with found products', () => {
      // given
      const products: Product[] = [
        { id: 1, name: 'fake product 1' } as Product,
        {
          id: 2,
          name: 'fake product 2',
        } as Product,
      ];
      (mockGetActiveProducts.execute as jest.Mock).mockReturnValue(Promise.resolve(products));

      // when
      const testRequest: request.Test = request(app.getHttpServer()).get('/api/products');

      // then
      return testRequest.expect(200).expect((response: Response) => {
        expect(response.body).toStrictEqual(products as GetProductResponse[]);
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create product using body request transformed to command', (done: DoneCallback) => {
      // given
      const postProductRequest: PostProductRequest = {
        name: 'new product name',
        description: 'new product description',
        price: 12.34,
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
            .post('/api/products')
            .send(postProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(201)
            .expect((response: Response) => {
              expect(mockAddNewProduct.execute).toHaveBeenCalledWith(ADMIN, {
                name: 'new product name',
                description: 'new product description',
                price: 12.34,
              } as NewProductCommand);
            })
            .end(done);
        });
    });

    it('should return http status code CREATED with created product id and location to it', (done: DoneCallback) => {
      // given
      const productId: ProductId = 42;
      (mockAddNewProduct.execute as jest.Mock).mockReturnValue(Promise.resolve(productId));

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
            .post('/api/products')
            .send({} as PostProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(201)
            .expect((response: Response) => {
              expect(response.body).toStrictEqual({ id: productId });
              expect(response.header.location).toBe('/api/products/42');
            })
            .end(done);
        });
    });

    it('should return http status code BAD REQUEST when invalid product', (done: DoneCallback) => {
      // given
      (mockAddNewProduct.execute as jest.Mock).mockImplementation(() => {
        throw new InvalidProductError('invalid product');
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
            .post('/api/products')
            .send({} as PostProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(400)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 400,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'invalid product',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer())
        .post('/api/products')
        .send({} as PostProductRequest);

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('PUT /api/products', () => {
    it('should update product using id in path and body request transformed to command', (done: DoneCallback) => {
      // given
      const putProductRequest: PutProductRequest = {
        description: 'updated product description',
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
            .put('/api/products/1337')
            .send(putProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockUpdateExistingProduct.execute).toHaveBeenCalledWith(ADMIN, {
                productId: 1337,
                description: 'updated product description',
              } as UpdateProductCommand);
            })
            .end(done);
        });
    });

    it('should return http status code BAD REQUEST when invalid product', (done: DoneCallback) => {
      // given
      (mockUpdateExistingProduct.execute as jest.Mock).mockImplementation(() => {
        throw new InvalidProductError('invalid product');
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
            .put('/api/products/1337')
            .send({} as PutProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(400)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 400,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'invalid product',
              });
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when product not found', (done: DoneCallback) => {
      // given
      (mockUpdateExistingProduct.execute as jest.Mock).mockImplementation(() => {
        throw new ProductNotFoundError('product not found');
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
            .put('/api/products/1337')
            .send({} as PutProductRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'product not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer())
        .put('/api/products/1337')
        .send({} as PutProductRequest);

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('DELETE /api/products', () => {
    it('should archive product using id in path transformed to command', (done: DoneCallback) => {
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
            .delete('/api/products/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(204)
            .expect((response: Response) => {
              expect(mockArchiveProduct.execute).toHaveBeenCalledWith(ADMIN, { productId: 1337 } as ArchiveProductCommand);
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when product not found', (done: DoneCallback) => {
      // given
      (mockArchiveProduct.execute as jest.Mock).mockImplementation(() => {
        throw new ProductNotFoundError('product not found');
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
            .delete('/api/products/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'product not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).delete('/api/products/1337');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
