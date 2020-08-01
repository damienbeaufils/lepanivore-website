import { Feature, FeatureFactoryInterface } from '../../domain/feature/feature';
import { FeatureInterface } from '../../domain/feature/feature.interface';
import { FeatureRepository } from '../../domain/feature/feature.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { DisableProductOrdering } from '../disable-product-ordering';

describe('uses_cases/DisableProductOrdering', () => {
  let disableProductOrdering: DisableProductOrdering;
  let mockFeatureRepository: FeatureRepository;
  let featureToDisable: Feature;

  beforeEach(() => {
    Feature.factory = {} as FeatureFactoryInterface;
    Feature.factory.copy = jest.fn();

    featureToDisable = { name: 'fake feature' } as Feature;
    featureToDisable.disable = jest.fn();
    (Feature.factory.copy as jest.Mock).mockReturnValue(featureToDisable);

    mockFeatureRepository = {} as FeatureRepository;
    mockFeatureRepository.save = jest.fn();
    mockFeatureRepository.findByName = jest.fn();

    disableProductOrdering = new DisableProductOrdering(mockFeatureRepository);
  });

  describe('execute()', () => {
    it('should search for product ordering feature', async () => {
      // when
      await disableProductOrdering.execute(ADMIN);

      // then
      expect(mockFeatureRepository.findByName).toHaveBeenCalledWith('PRODUCT_ORDERING');
    });

    it('should copy found feature in order to disable it', async () => {
      // given
      const existingFeature: FeatureInterface = { name: 'PRODUCT_ORDERING' } as FeatureInterface;
      (mockFeatureRepository.findByName as jest.Mock).mockReturnValue(Promise.resolve(existingFeature));

      // when
      await disableProductOrdering.execute(ADMIN);

      // then
      expect(Feature.factory.copy).toHaveBeenCalledWith(existingFeature);
    });

    it('should disable feature', async () => {
      // when
      await disableProductOrdering.execute(ADMIN);

      // then
      expect(featureToDisable.disable).toHaveBeenCalled();
    });

    it('should save disabled feature', async () => {
      // when
      await disableProductOrdering.execute(ADMIN);

      // then
      expect(mockFeatureRepository.save).toHaveBeenCalledWith(featureToDisable);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = disableProductOrdering.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = disableProductOrdering.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
