import { ClosingPeriodInterface } from '../domain/closing-period/closing-period.interface';
import { ClosingPeriodRepository } from '../domain/closing-period/closing-period.repository';
import { DeleteClosingPeriodCommand } from '../domain/closing-period/commands/delete-closing-period-command';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class DeleteClosingPeriod {
  constructor(private readonly closingPeriodRepository: ClosingPeriodRepository) {}

  async execute(user: User, deleteClosingPeriodCommand: DeleteClosingPeriodCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const closingPeriodToDelete: ClosingPeriodInterface = await this.closingPeriodRepository.findById(deleteClosingPeriodCommand.closingPeriodId);
    await this.closingPeriodRepository.delete(closingPeriodToDelete);
  }
}
