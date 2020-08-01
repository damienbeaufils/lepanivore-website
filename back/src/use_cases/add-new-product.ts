import { NewProductCommand } from '../domain/product/commands/new-product-command';
import { Product } from '../domain/product/product';
import { ProductRepository } from '../domain/product/product.repository';
import { ProductId } from '../domain/type-aliases';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class AddNewProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(user: User, newProductCommand: NewProductCommand): Promise<ProductId> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const product: Product = Product.factory.create(newProductCommand);

    return this.productRepository.save(product);
  }
}
