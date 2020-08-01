import { ClosingPeriod } from '../domain/closing-period/closing-period';
import { ClosingPeriodRepository } from '../domain/closing-period/closing-period.repository';
import { NewClosingPeriodCommand } from '../domain/closing-period/commands/new-closing-period-command';
import { ClosingPeriodId } from '../domain/type-aliases';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class AddNewClosingPeriod {
  constructor(private readonly closingPeriodRepository: ClosingPeriodRepository) {}

  async execute(user: User, newClosingPeriodCommand: NewClosingPeriodCommand): Promise<ClosingPeriodId> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const closingPeriod: ClosingPeriod = ClosingPeriod.factory.create(newClosingPeriodCommand);

    return this.closingPeriodRepository.save(closingPeriod);
  }
}
