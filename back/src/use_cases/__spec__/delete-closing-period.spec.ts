import { ClosingPeriodInterface } from '../../domain/closing-period/closing-period.interface';
import { ClosingPeriodRepository } from '../../domain/closing-period/closing-period.repository';
import { DeleteClosingPeriodCommand } from '../../domain/closing-period/commands/delete-closing-period-command';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { DeleteClosingPeriod } from '../delete-closing-period';

describe('uses_cases/DeleteClosingPeriod', () => {
  let deleteClosingPeriod: DeleteClosingPeriod;
  let mockClosingPeriodRepository: ClosingPeriodRepository;
  let deleteClosingPeriodCommand: DeleteClosingPeriodCommand;

  beforeEach(() => {
    mockClosingPeriodRepository = {} as ClosingPeriodRepository;
    mockClosingPeriodRepository.delete = jest.fn();
    mockClosingPeriodRepository.findById = jest.fn();

    deleteClosingPeriod = new DeleteClosingPeriod(mockClosingPeriodRepository);

    deleteClosingPeriodCommand = {
      closingPeriodId: 42,
    };
  });

  describe('execute()', () => {
    it('should search for existing closingPeriod', async () => {
      // given
      deleteClosingPeriodCommand.closingPeriodId = 1337;

      // when
      await deleteClosingPeriod.execute(ADMIN, deleteClosingPeriodCommand);

      // then
      expect(mockClosingPeriodRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should delete found closingPeriod', async () => {
      // given
      const existingClosingPeriod: ClosingPeriodInterface = { startDate: new Date('2030-06-13T04:41:20') } as ClosingPeriodInterface;
      (mockClosingPeriodRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingClosingPeriod));

      // when
      await deleteClosingPeriod.execute(ADMIN, deleteClosingPeriodCommand);

      // then
      expect(mockClosingPeriodRepository.delete).toHaveBeenCalledWith(existingClosingPeriod);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = deleteClosingPeriod.execute(user, deleteClosingPeriodCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = deleteClosingPeriod.execute(user, deleteClosingPeriodCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
