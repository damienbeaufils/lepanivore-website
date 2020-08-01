import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ClosingPeriodInterface } from '../../src/domain/closing-period/closing-period.interface';
import { ClosingPeriodNotFoundError } from '../../src/domain/closing-period/errors/closing-period-not-found.error';
import { ClosingPeriodId } from '../../src/domain/type-aliases';
import { EnvironmentConfigService } from '../../src/infrastructure/config/environment-config/environment-config.service';
import { DatabaseClosingPeriodRepository } from '../../src/infrastructure/repositories/database-closing-period.repository';
import { ClosingPeriodEntity } from '../../src/infrastructure/repositories/entities/closing-period.entity';
import { RepositoriesModule } from '../../src/infrastructure/repositories/repositories.module';
import { e2eEnvironmentConfigService } from '../e2e-config';
import { runDatabaseMigrations } from './database-e2e.utils';

describe('infrastructure/repositories/DatabaseClosingPeriodRepository', () => {
  let app: INestApplication;
  let databaseClosingPeriodRepository: DatabaseClosingPeriodRepository;
  let closingPeriodEntityRepository: Repository<ClosingPeriodEntity>;
  let closingPeriodWithoutId: ClosingPeriodInterface;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RepositoriesModule],
    })
      .overrideProvider(EnvironmentConfigService)
      .useValue(e2eEnvironmentConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await runDatabaseMigrations(app.get(EnvironmentConfigService));

    databaseClosingPeriodRepository = app.get(DatabaseClosingPeriodRepository);
    // @ts-ignore
    closingPeriodEntityRepository = databaseClosingPeriodRepository.closingPeriodEntityRepository;
  });

  beforeEach(async () => {
    await closingPeriodEntityRepository.clear();

    closingPeriodWithoutId = {
      startDate: new Date('2020-06-13T12:00:00Z'),
      endDate: new Date('2030-06-13T12:00:00Z'),
    } as ClosingPeriodInterface;
  });

  describe('save()', () => {
    it('should persist closing period in database', async () => {
      // when
      await databaseClosingPeriodRepository.save(closingPeriodWithoutId);

      // then
      const count: number = await closingPeriodEntityRepository.count();
      expect(count).toBe(1);
    });

    it('should return saved closing period with an id', async () => {
      // when
      const result: ClosingPeriodId = await databaseClosingPeriodRepository.save(closingPeriodWithoutId);

      // then
      expect(result).toBeDefined();
    });
  });

  describe('delete()', () => {
    it('should delete existing closing period in database', async () => {
      // given
      const savedClosingPeriodId: ClosingPeriodId = await databaseClosingPeriodRepository.save(closingPeriodWithoutId);
      const savedClosingPeriod: ClosingPeriodInterface = await databaseClosingPeriodRepository.findById(savedClosingPeriodId);

      // when
      await databaseClosingPeriodRepository.delete(savedClosingPeriod);

      // then
      const count: number = await closingPeriodEntityRepository.count();
      expect(count).toBe(0);
    });
  });

  describe('findById()', () => {
    it('should return found closing period in database', async () => {
      // given
      await databaseClosingPeriodRepository.save(closingPeriodWithoutId);
      const closingPeriodWithoutIdAndDifferentEndDate: ClosingPeriodInterface = {
        ...closingPeriodWithoutId,
        endDate: new Date('2040-06-13T12:00:00Z'),
      };
      const savedClosingPeriodIdDifferentEndDate: ClosingPeriodId = await databaseClosingPeriodRepository.save(
        closingPeriodWithoutIdAndDifferentEndDate
      );

      // when
      const result: ClosingPeriodInterface = await databaseClosingPeriodRepository.findById(savedClosingPeriodIdDifferentEndDate);

      // then
      expect(result.id).toBe(savedClosingPeriodIdDifferentEndDate);
      expect(result).toMatchObject(closingPeriodWithoutIdAndDifferentEndDate);
    });

    it('should throw exception when closing period not found in database', async () => {
      // given
      const randomId: ClosingPeriodId = Math.floor(Math.random() * 1000 + 1000);

      // when
      const result: Promise<ClosingPeriodInterface> = databaseClosingPeriodRepository.findById(randomId);

      // then
      await expect(result).rejects.toThrow(new ClosingPeriodNotFoundError(`ClosingPeriod not found with id "${randomId}"`));
    });
  });

  describe('findAll()', () => {
    it('should return found closingPeriods in database', async () => {
      // given
      await databaseClosingPeriodRepository.save(closingPeriodWithoutId);
      const closingPeriodWithoutIdAndDifferentEndDate: ClosingPeriodInterface = {
        ...closingPeriodWithoutId,
        endDate: new Date('2040-06-13T12:00:00Z'),
      };
      await databaseClosingPeriodRepository.save(closingPeriodWithoutIdAndDifferentEndDate);

      // when
      const result: ClosingPeriodInterface[] = await databaseClosingPeriodRepository.findAll();

      // then
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject(closingPeriodWithoutId);
      expect(result[1]).toMatchObject(closingPeriodWithoutIdAndDifferentEndDate);
    });

    it('should return empty array when no closing period has been found in database', async () => {
      // when
      const result: ClosingPeriodInterface[] = await databaseClosingPeriodRepository.findAll();

      // then
      expect(result).toHaveLength(0);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
