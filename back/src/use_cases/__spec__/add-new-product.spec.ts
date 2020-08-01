import { NewProductCommand } from '../../domain/product/commands/new-product-command';
import { Product, ProductFactoryInterface } from '../../domain/product/product';
import { ProductRepository } from '../../domain/product/product.repository';
import { ProductId } from '../../domain/type-aliases';
import { InvalidUserError } from '../../domain/user/errors/invalid-user.error';
import { ADMIN, User } from '../../domain/user/user';
import { AddNewProduct } from '../add-new-product';

describe('uses_cases/AddNewProduct', () => {
  let addNewProduct: AddNewProduct;
  let mockProductRepository: ProductRepository;
  let newProductCommand: NewProductCommand;

  beforeEach(() => {
    Product.factory = {} as ProductFactoryInterface;
    Product.factory.create = jest.fn();

    mockProductRepository = {} as ProductRepository;
    mockProductRepository.save = jest.fn();

    addNewProduct = new AddNewProduct(mockProductRepository);
    newProductCommand = { name: 'name', description: 'description', price: 42 };
  });

  describe('execute()', () => {
    it('should create new product using command', async () => {
      // given
      newProductCommand.name = 'new product name';
      newProductCommand.description = 'new product description';
      newProductCommand.price = 19.88;

      // when
      await addNewProduct.execute(ADMIN, newProductCommand);

      // then
      expect(Product.factory.create).toHaveBeenCalledWith(newProductCommand);
    });

    it('should save created product', async () => {
      // given
      const createdProduct: Product = { name: 'new product name' } as Product;
      (Product.factory.create as jest.Mock).mockReturnValue(createdProduct);

      // when
      await addNewProduct.execute(ADMIN, newProductCommand);

      // then
      expect(mockProductRepository.save).toHaveBeenCalledWith(createdProduct);
    });

    it('should return invalid user error when no authenticated user', async () => {
      // given
      const user: User = undefined;

      // when
      const result: Promise<ProductId> = addNewProduct.execute(user, newProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });

    it('should return invalid user error when user is not admin', async () => {
      // given
      const user: User = { username: '' };

      // when
      const result: Promise<ProductId> = addNewProduct.execute(user, newProductCommand);

      // then
      await expect(result).rejects.toThrow(new InvalidUserError('User has to be ADMIN to execute this action'));
    });
  });
});
