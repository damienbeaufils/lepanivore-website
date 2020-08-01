import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { ClosingPeriodInterface } from '../../src/domain/closing-period/closing-period.interface';
import { DeleteClosingPeriodCommand } from '../../src/domain/closing-period/commands/delete-closing-period-command';
import { NewClosingPeriodCommand } from '../../src/domain/closing-period/commands/new-closing-period-command';
import { ClosingPeriodNotFoundError } from '../../src/domain/closing-period/errors/closing-period-not-found.error';
import { InvalidClosingPeriodError } from '../../src/domain/closing-period/errors/invalid-closing-period.error';
import { ClosingPeriodId } from '../../src/domain/type-aliases';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { GetClosingPeriodResponse } from '../../src/infrastructure/rest/models/get-closing-period-response';
import { PostClosingPeriodRequest } from '../../src/infrastructure/rest/models/post-closing-period-request';
import { RestModule } from '../../src/infrastructure/rest/rest.module';
import { ProxyServicesDynamicModule } from '../../src/infrastructure/use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../../src/infrastructure/use_cases_proxy/use-case-proxy';
import { AddNewClosingPeriod } from '../../src/use_cases/add-new-closing-period';
import { DeleteClosingPeriod } from '../../src/use_cases/delete-closing-period';
import { GetClosingPeriods } from '../../src/use_cases/get-closing-periods';
import { ADMIN_E2E_PASSWORD, ADMIN_E2E_USERNAME, e2eEnvironmentConfigService } from '../e2e-config';
import DoneCallback = jest.DoneCallback;

describe('infrastructure/rest/ClosingPeriodController (e2e)', () => {
  let app: INestApplication;
  let mockGetClosingPeriods: GetClosingPeriods;
  let mockAddNewClosingPeriod: AddNewClosingPeriod;
  let mockDeleteClosingPeriod: DeleteClosingPeriod;

  beforeAll(async () => {
    mockGetClosingPeriods = {} as GetClosingPeriods;
    mockGetClosingPeriods.execute = jest.fn();
    const mockGetClosingPeriodsProxyService: UseCaseProxy<GetClosingPeriods> = {
      getInstance: () => mockGetClosingPeriods,
    } as UseCaseProxy<GetClosingPeriods>;

    mockAddNewClosingPeriod = {} as AddNewClosingPeriod;
    mockAddNewClosingPeriod.execute = jest.fn();
    const mockAddNewClosingPeriodsProxyService: UseCaseProxy<AddNewClosingPeriod> = {
      getInstance: () => mockAddNewClosingPeriod,
    } as UseCaseProxy<AddNewClosingPeriod>;

    mockDeleteClosingPeriod = {} as DeleteClosingPeriod;
    mockDeleteClosingPeriod.execute = jest.fn();
    const mockDeleteClosingPeriodsProxyService: UseCaseProxy<DeleteClosingPeriod> = {
      getInstance: () => mockDeleteClosingPeriod,
    } as UseCaseProxy<DeleteClosingPeriod>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestModule],
    })
      .overrideProvider(ProxyServicesDynamicModule.GET_CLOSING_PERIODS_PROXY_SERVICE)
      .useValue(mockGetClosingPeriodsProxyService)
      .overrideProvider(ProxyServicesDynamicModule.ADD_NEW_CLOSING_PERIOD_PROXY_SERVICE)
      .useValue(mockAddNewClosingPeriodsProxyService)
      .overrideProvider(ProxyServicesDynamicModule.DELETE_CLOSING_PERIOD_PROXY_SERVICE)
      .useValue(mockDeleteClosingPeriodsProxyService)
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /api/closing-periods', () => {
    it('should return http status code OK with found closing periods', () => {
      // given
      const closingPeriods: ClosingPeriodInterface[] = [
        {
          id: 1,
          startDate: new Date('2020-07-01T12:00:00Z'),
          endDate: new Date('2020-08-15T12:00:00Z'),
        } as ClosingPeriodInterface,
        {
          id: 2,
          startDate: new Date('2020-12-15T12:00:00Z'),
          endDate: new Date('2021-01-02T12:00:00Z'),
        } as ClosingPeriodInterface,
      ];
      (mockGetClosingPeriods.execute as jest.Mock).mockReturnValue(Promise.resolve(closingPeriods));

      // when
      const testRequest: request.Test = request(app.getHttpServer()).get('/api/closing-periods');

      // then
      return testRequest.expect(200).expect((response: Response) => {
        expect(response.body).toStrictEqual([
          { id: 1, startDate: '2020-07-01', endDate: '2020-08-15' },
          { id: 2, startDate: '2020-12-15', endDate: '2021-01-02' },
        ] as GetClosingPeriodResponse[]);
      });
    });
  });

  describe('POST /api/closing-periods', () => {
    it('should create closing period using body request transformed to command', (done: DoneCallback) => {
      // given
      const postClosingPeriodRequest: PostClosingPeriodRequest = {
        startDate: '2020-06-13T04:41:20',
        endDate: '2030-06-13T04:41:20',
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
            .post('/api/closing-periods')
            .send(postClosingPeriodRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(201)
            .expect((response: Response) => {
              expect(mockAddNewClosingPeriod.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, {
                startDate: new Date('2020-06-13T04:41:20'),
                endDate: new Date('2030-06-13T04:41:20'),
              } as NewClosingPeriodCommand);
            })
            .end(done);
        });
    });

    it('should return http status code CREATED with created closing period id and location to it', (done: DoneCallback) => {
      // given
      const closingPeriodId: ClosingPeriodId = 42;
      (mockAddNewClosingPeriod.execute as jest.Mock).mockReturnValue(Promise.resolve(closingPeriodId));

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
            .post('/api/closing-periods')
            .send({} as PostClosingPeriodRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(201)
            .expect((response: Response) => {
              expect(response.body).toStrictEqual({ id: closingPeriodId });
              expect(response.header.location).toBe('/api/closing-periods/42');
            })
            .end(done);
        });
    });

    it('should return http status code BAD REQUEST when invalid closing period', (done: DoneCallback) => {
      // given
      (mockAddNewClosingPeriod.execute as jest.Mock).mockImplementation(() => {
        throw new InvalidClosingPeriodError('invalid closing period');
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
            .post('/api/closing-periods')
            .send({} as PostClosingPeriodRequest)
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(400)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 400,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'invalid closing period',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer())
        .post('/api/closing-periods')
        .send({} as PostClosingPeriodRequest);

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  describe('DELETE /api/closing-periods', () => {
    it('should delete closing period using id in path transformed to command', (done: DoneCallback) => {
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
            .delete('/api/closing-periods/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(204)
            .expect((response: Response) => {
              expect(mockDeleteClosingPeriod.execute).toHaveBeenCalledWith({ username: 'ADMIN' }, {
                closingPeriodId: 1337,
              } as DeleteClosingPeriodCommand);
            })
            .end(done);
        });
    });

    it('should return http status code NOT FOUND when closing period not found', (done: DoneCallback) => {
      // given
      (mockDeleteClosingPeriod.execute as jest.Mock).mockImplementation(() => {
        throw new ClosingPeriodNotFoundError('closing period not found');
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
            .delete('/api/closing-periods/1337')
            .set({ Authorization: `Bearer ${accessToken}` });

          // then
          testRequest
            .expect(404)
            .expect((response: Response) => {
              expect(response.body).toMatchObject({
                statusCode: 404,
                timestamp: expect.any(String),
                name: 'Error',
                message: 'closing period not found',
              });
            })
            .end(done);
        });
    });

    it('should return http status code Unauthorized when not authenticated as admin', () => {
      // when
      const testRequestWithoutAuthorizationHeader: request.Test = request(app.getHttpServer()).delete('/api/closing-periods/1337');

      // then
      return testRequestWithoutAuthorizationHeader.expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
