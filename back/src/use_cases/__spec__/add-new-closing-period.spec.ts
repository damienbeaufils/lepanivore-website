import { ClosingPeriod, ClosingPeriodFactoryInterface } from '../../domain/closing-period/closing-period';
import { ClosingPeriodRepository } from '../../domain/closing-period/closing-period.repository';
import { NewClosingPeriodCommand } from '../../domain/closing-period/commands/new-closing-period-command';
import { ClosingPeriodId } from '../../domain/type-aliases';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { AddNewClosingPeriod } from '../add-new-closing-period';

describe('uses_cases/AddNewClosingPeriod', () => {
  let addNewClosingPeriod: AddNewClosingPeriod;
  let mockClosingPeriodRepository: ClosingPeriodRepository;
  let newClosingPeriodCommand: NewClosingPeriodCommand;

  beforeEach(() => {
    ClosingPeriod.factory = {} as ClosingPeriodFactoryInterface;
    ClosingPeriod.factory.create = jest.fn();

    mockClosingPeriodRepository = {} as ClosingPeriodRepository;
    mockClosingPeriodRepository.save = jest.fn();

    addNewClosingPeriod = new AddNewClosingPeriod(mockClosingPeriodRepository);

    newClosingPeriodCommand = { startDate: new Date(), endDate: new Date() };
  });

  describe('execute()', () => {
    it('should create new closingPeriod using command', async () => {
      // given
      newClosingPeriodCommand.startDate = new Date('2020-06-13T04:41:20');
      newClosingPeriodCommand.endDate = new Date('2030-06-13T04:41:20');

      // when
      await addNewClosingPeriod.execute(ADMIN, newClosingPeriodCommand);

      // then
      expect(ClosingPeriod.factory.create).toHaveBeenCalledWith(newClosingPeriodCommand);
    });

    it('should save created closingPeriod', async () => {
      // given
      const createdClosingPeriod: ClosingPeriod = { startDate: new Date('2020-06-13T04:41:20') } as ClosingPeriod;
      (ClosingPeriod.factory.create as jest.Mock).mockReturnValue(createdClosingPeriod);

      // when
      await addNewClosingPeriod.execute(ADMIN, newClosingPeriodCommand);

      // then
      expect(mockClosingPeriodRepository.save).toHaveBeenCalledWith(createdClosingPeriod);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<ClosingPeriodId> = addNewClosingPeriod.execute(user, newClosingPeriodCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<ClosingPeriodId> = addNewClosingPeriod.execute(user, newClosingPeriodCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
