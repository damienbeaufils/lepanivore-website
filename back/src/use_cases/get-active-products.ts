import { ProductStatus } from '../domain/product/product-status';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class GetActiveProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(user: User): Promise<ProductInterface[]> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    return this.productRepository.findAllByStatus(ProductStatus.ACTIVE);
  }
}
