import { Feature } from '../domain/feature/feature';
import { FeatureInterface } from '../domain/feature/feature.interface';
import { FeatureRepository } from '../domain/feature/feature.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class DisableProductOrdering {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async execute(user: User): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const feature: FeatureInterface = await this.featureRepository.findByName(Feature.PRODUCT_ORDERING_FEATURE_NAME);
    const featureToUpdate: Feature = Feature.factory.copy(feature);
    featureToUpdate.disable();
    await this.featureRepository.save(featureToUpdate);
  }
}
