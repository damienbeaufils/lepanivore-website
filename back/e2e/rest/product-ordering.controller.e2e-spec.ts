import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { FeatureStatus } from '../../src/domain/feature/feature-status';
import { FeatureInterface } from '../../src/domain/feature/feature.interface';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { GetProductOrderingResponse } from '../../src/infrastructure/rest/models/get-product-ordering-response';
import { RestModule } from '../../src/infrastructure/rest/rest.module';
import { ProxyServicesDynamicModule } from '../../src/infrastructure/use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../../src/infrastructure/use_cases_proxy/use-case-proxy';
import { DisableProductOrdering } from '../../src/use_cases/disable-product-ordering';
import { EnableProductOrdering } from '../../src/use_cases/enable-product-ordering';
import { GetProductOrderingStatus } from '../../src/use_cases/get-product-ordering-status';
import { ADMIN_E2E_PASSWORD, ADMIN_E2E_USERNAME, e2eEnvironmentConfigService } from '../e2e-config';
import DoneCallback = jest.DoneCallback;

describe('infrastructure/rest/ProductOrderingController (e2e)', () => {
  let app: INestApplication;
  let mockGetProductOrderingStatus: GetProductOrderingStatus;
  let mockEnableProductOrdering: EnableProductOrdering;
  let mockDisableProductOrdering: DisableProductOrdering;

  beforeAll(async () => {
    mockGetProductOrderingStatus = {} as GetProductOrderingStatus;
    mockGetProductOrderingStatus.execute = jest.fn();
    const mockGetProductOrderingStatusProxyService: UseCaseProxy<GetProductOrderingStatus> = {
      getInstance: () => mockGetProductOrderingStatus,
    } as UseCaseProxy<GetProductOrderingStatus>;

    mockEnableProductOrdering = {} as EnableProductOrdering;
    mockEnableProductOrdering.execute = jest.fn();
    const mockEnableProductOrderingProxyService: UseCaseProxy<EnableProductOrdering> = {
      getInstance: () => mockEnableProductOrdering,
    } as UseCaseProxy<EnableProductOrdering>;

    mockDisableProductOrdering = {} as DisableProductOrdering;
    mockDisableProductOrdering.execute = jest.fn();
    const mockDisableProductOrderingProxyService: UseCaseProxy<DisableProductOrdering> = {
      getInstance: () => mockDisableProductOrdering,
    } as UseCaseProxy<DisableProductOrdering>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestModule],
    })
      .overrideProvider(ProxyServicesDynamicModule.GET_PRODUCT_ORDERING_STATUS_PROXY_SERVICE)
      .useValue(mockGetProductOrderingStatusProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ENABLE_PRODUCT_ORDERING_PROXY_SERVICE)
      .useValue(mockEnableProductOrderingProxyService)
      .overrideProvider(ProxyServicesDynamicModule.DISABLE_PRODUCT_ORDERING_PROXY_SERVICE)
      .useValue(mockDisableProductOrderingProxyService)
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    (mockGetProductOrderingStatus.execute as jest.Mock).mockClear();
    (mockEnableProductOrdering.execute as jest.Mock).mockClear();
    (mockDisableProductOrdering.execute as jest.Mock).mockClear();
  });

  describe('GET /api/product-ordering/status', () => {
    it('should return http status code OK with product ordering feature', () => {
      // given
      const feature: FeatureInterface = {
        id: 1,
        name: 'PRODUCT_ORDERING',
        status: FeatureStatus.ENABLED,
      };
      (mockGetProductOrderingStatus.execute as jest.Mock).mockReturnValue(Promise.resolve(feature));

      // when
      const testRequest: request.Test = request(app.getHttpServer()).get('/api/product-ordering/status');

      // then
      testRequest.expect(200).expect((response: Response) => {
        expect(response.body).toStrictEqual({
          id: 1,
          name: 'PRODUCT_ORDERING',
          status: FeatureStatus.ENABLED,
        } as GetProductOrderingResponse);
      });
    });
  });

  describe('PUT /api/product-ordering/enable', () => {
    it('should enable product ordering feature', (done: DoneCallback) => {
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
            .put('/api/product-ordering/enable')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockEnableProductOrdering.execute).toHaveBeenCalled();
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).put('/api/product-ordering/enable');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('PUT /api/product-ordering/disable', () => {
    it('should disable product ordering feature', (done: DoneCallback) => {
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
            .put('/api/product-ordering/disable')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(200)
            .expect((response: Response) => {
              expect(mockDisableProductOrdering.execute).toHaveBeenCalled();
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).put('/api/product-ordering/disable');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
