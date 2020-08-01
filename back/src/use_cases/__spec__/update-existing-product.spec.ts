import { OrderInterface } from '../../domain/order/order.interface';
import { UpdateProductCommand } from '../../domain/product/commands/update-product-command';
import { Product, ProductFactoryInterface } from '../../domain/product/product';
import { ProductInterface } from '../../domain/product/product.interface';
import { ProductRepository } from '../../domain/product/product.repository';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { UpdateExistingProduct } from '../update-existing-product';

describe('uses_cases/UpdateExistingProduct', () => {
  let updateExistingProduct: UpdateExistingProduct;
  let mockProductRepository: ProductRepository;
  let updateProductCommand: UpdateProductCommand;
  let productToUpdate: Product;

  beforeEach(() => {
    Product.factory = {} as ProductFactoryInterface;
    Product.factory.copy = jest.fn();

    productToUpdate = { name: 'fake product' } as Product;
    productToUpdate.updateWith = jest.fn();
    (Product.factory.copy as jest.Mock).mockReturnValue(productToUpdate);

    mockProductRepository = {} as ProductRepository;
    mockProductRepository.save = jest.fn();
    mockProductRepository.findById = jest.fn();

    updateExistingProduct = new UpdateExistingProduct(mockProductRepository);

    updateProductCommand = {
      productId: 42,
      description: 'updated description',
    };
  });

  describe('execute()', () => {
    it('should search for existing product', async () => {
      // given
      updateProductCommand.productId = 1337;

      // when
      await updateExistingProduct.execute(ADMIN, updateProductCommand);

      // then
      expect(mockProductRepository.findById).toHaveBeenCalledWith(1337);
    });

    it('should copy found product in order to update it', async () => {
      // given
      const existingProduct: ProductInterface = { name: 'fake product' } as ProductInterface;
      (mockProductRepository.findById as jest.Mock).mockReturnValue(Promise.resolve(existingProduct));

      // when
      await updateExistingProduct.execute(ADMIN, updateProductCommand);

      // then
      expect(Product.factory.copy).toHaveBeenCalledWith(existingProduct);
    });

    it('should update existing product with command', async () => {
      // when
      await updateExistingProduct.execute(ADMIN, updateProductCommand);

      // then
      expect(productToUpdate.updateWith).toHaveBeenCalledWith(updateProductCommand);
    });

    it('should save updated product', async () => {
      // when
      await updateExistingProduct.execute(ADMIN, updateProductCommand);

      // then
      expect(mockProductRepository.save).toHaveBeenCalledWith(productToUpdate);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<void> = updateExistingProduct.execute(user, updateProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<void> = updateExistingProduct.execute(user, updateProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
