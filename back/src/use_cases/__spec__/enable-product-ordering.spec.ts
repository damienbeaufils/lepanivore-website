import { Feature, FeatureFactoryInterface } from '../../domain/feature/feature';
import { FeatureInterface } from '../../domain/feature/feature.interface';
import { FeatureRepository } from '../../domain/feature/feature.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { EnableProductOrdering } from '../enable-product-ordering';

describe('uses_cases/EnableProductOrdering', () => {
  let enableProductOrdering: EnableProductOrdering;
  let mockFeatureRepository: FeatureRepository;
  let featureToEnable: Feature;

  beforeEach(() => {
    Feature.factory = {} as FeatureFactoryInterface;
    Feature.factory.copy = jest.fn();

    featureToEnable = { name: 'fake feature' } as Feature;
    featureToEnable.enable = jest.fn();
    (Feature.factory.copy as jest.Mock).mockReturnValue(featureToEnable);

    mockFeatureRepository = {} as FeatureRepository;
    mockFeatureRepository.save = jest.fn();
    mockFeatureRepository.findByName = jest.fn();

    enableProductOrdering = new EnableProductOrdering(mockFeatureRepository);
  });

  describe('execute()', () => {
    it('should search for product ordering feature', async () => {
      // when
      await enableProductOrdering.execute(ADMIN);

      // then
      expect(mockFeatureRepository.findByName).toHaveBeenCalledWith('PRODUCT_ORDERING');
    });

    it('should copy found feature in order to enable it', async () => {
      // given
      const existingFeature: FeatureInterface = { name: 'PRODUCT_ORDERING' } as FeatureInterface;
      (mockFeatureRepository.findByName as jest.Mock).mockReturnValue(Promise.resolve(existingFeature));

      // when
      await enableProductOrdering.execute(ADMIN);

      // then
      expect(Feature.factory.copy).toHaveBeenCalledWith(existingFeature);
    });

    it('should enable feature', async () => {
      // when
      await enableProductOrdering.execute(ADMIN);

      // then
      expect(featureToEnable.enable).toHaveBeenCalled();
    });

    it('should save enabled feature', async () => {
      // when
      await enableProductOrdering.execute(ADMIN);

      // then
      expect(mockFeatureRepository.save).toHaveBeenCalledWith(featureToEnable);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = enableProductOrdering.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = enableProductOrdering.execute(user);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
