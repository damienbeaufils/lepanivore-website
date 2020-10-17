import { cloneDeep } from 'lodash';
import { ClosingPeriod } from '../closing-period';
import { NewClosingPeriodCommand } from '../commands/new-closing-period-command';
import { InvalidClosingPeriodError } from '../errors/invalid-closing-period.error';

describe('domain/closing-period/ClosingPeriod', () => {
  let realDateConstructor: DateConstructor;

  beforeAll(() => {
    realDateConstructor = Date;
  });

  beforeEach(() => {
    global.Date = realDateConstructor;
  });

  describe('factory', () => {
    describe('create()', () => {
      let newClosingPeriodCommand: NewClosingPeriodCommand;

      beforeEach(() => {
        newClosingPeriodCommand = {
          startDate: new Date('2030-06-13T04:41:20'),
          endDate: new Date('2040-06-13T04:41:20'),
        };
      });

      describe('id', () => {
        it('should initialize with no id', () => {
          // when
          const result: ClosingPeriod = ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result.id).toBeUndefined();
        });
      });

      describe('startDate', () => {
        it('should bind start date from command', () => {
          // given
          const startDate: Date = new Date('2030-03-28T16:41:20');
          newClosingPeriodCommand.startDate = startDate;

          // when
          const result: ClosingPeriod = ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result.startDate).toBe(startDate);
        });

        it('should fail when no start date', () => {
          // given
          newClosingPeriodCommand.startDate = undefined;

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).toThrow(new InvalidClosingPeriodError('start date has to be defined'));
        });

        it('should fail when start date is in the past', () => {
          // given
          newClosingPeriodCommand.startDate = new Date('2020-06-02T04:41:20');
          const now: Date = new Date('2020-06-03T04:41:20');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(now));

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).toThrow(new InvalidClosingPeriodError('start date 2020-06-02T08:41:20.000Z has to be in the future'));
        });

        it('should not fail when start date is same date as now but different hour', () => {
          // given
          newClosingPeriodCommand.startDate = new Date('2020-06-03T12:41:20');
          const now: Date = new Date('2020-06-03T13:41:20');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(now));

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).not.toThrow();
        });
      });

      describe('endDate', () => {
        it('should bind end date from command', () => {
          // given
          const endDate: Date = new Date('2040-03-28T16:41:20');
          newClosingPeriodCommand.endDate = endDate;

          // when
          const result: ClosingPeriod = ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result.endDate).toBe(endDate);
        });

        it('should fail when no end date', () => {
          // given
          newClosingPeriodCommand.endDate = undefined;

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).toThrow(new InvalidClosingPeriodError('end date has to be defined'));
        });

        it('should fail when end date is in the past', () => {
          // given
          newClosingPeriodCommand.endDate = new Date('2020-06-02T04:41:20');
          const now: Date = new Date('2020-06-03T04:41:20');
          // @ts-ignore
          jest.spyOn(global, 'Date').mockImplementation(() => cloneDeep(now));

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).toThrow(new InvalidClosingPeriodError('end date 2020-06-02T08:41:20.000Z has to be in the future'));
        });

        it('should fail when end date is before start date', () => {
          // given
          newClosingPeriodCommand.endDate = new Date('2040-03-28T16:41:20');
          newClosingPeriodCommand.startDate = new Date('2040-03-28T16:41:21');

          // when
          const result = () => ClosingPeriod.factory.create(newClosingPeriodCommand);

          // then
          expect(result).toThrow(
            new InvalidClosingPeriodError('end date 2040-03-28T20:41:20.000Z has to be greater than start date 2040-03-28T20:41:21.000Z')
          );
        });
      });
    });
  });
});
