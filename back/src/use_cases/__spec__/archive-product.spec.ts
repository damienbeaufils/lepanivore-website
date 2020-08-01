import { ArchiveProductCommand } from '../../domain/product/commands/archive-product-command';
import { Product, ProductFactoryInterface } from '../../domain/product/product';
import { ProductInterface } from '../../domain/product/product.interface';
import { ProductRepository } from '../../domain/product/product.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { ArchiveProduct } from '../archive-product';

describe('uses_cases/ArchiveProduct', () => {
  let archiveProduct: ArchiveProduct;
  let mockProductRepository: ProductRepository;
  let archiveProductCommand: ArchiveProductCommand;
  let productToArchive: Product;

  beforeEach(() => {
    Product.factory = {} as ProductFactoryInterface;
    Product.factory.copy = jest.fn();

    productToArchive = { name: 'fake product' } as Product;
    productToArchive.archive = jest.fn();
    (Product.factory.copy as jest.Mock).mockReturnValue(productToArchive);

    mockProductRepository = {} as ProductRepository;
    mockProductRepository.save = jest.fn();
    mockProductRepository.findById = jest.fn();

    archiveProduct = new ArchiveProduct(mockProductRepository);

    archiveProductCommand = {
      productId: 42,
    };
  });

  describe('execute()', () => {
    it('should search for existing product', async () => {
      // given
      archiveProductCommand.productId = 1337;

      // when
      await archiveProduct.execute(ADMIN, archiveProductCommand);

      // then
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should copy found product in order to archive it', async () => {
      // given
      const existingProduct: ProductInterface = { name: 'fake product' } as ProductInterface;
      (mockProductRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingProduct));

      // when
      await archiveProduct.execute(ADMIN, archiveProductCommand);

      // then
      expect(Product.factory.copy).toHaveBeenCalledWith(existingProduct);
    });

    it('should archive product', async () => {
      // when
      await archiveProduct.execute(ADMIN, archiveProductCommand);

      // then
      expect(productToArchive.archive).toHaveBeenCalled();
    });

    it('should save archived product', async () => {
      // when
      await archiveProduct.execute(ADMIN, archiveProductCommand);

      // then
      expect(mockProductRepository.save).toHaveBeenCalledWith(productToArchive);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = archiveProduct.execute(user, archiveProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = archiveProduct.execute(user, archiveProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
