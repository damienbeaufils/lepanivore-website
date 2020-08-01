import { UpdateProductCommand } from '../domain/product/commands/update-product-command';
import { Product } from '../domain/product/product';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class UpdateExistingProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(user: User, updateProductCommand: UpdateProductCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const foundProduct: ProductInterface = await this.productRepository.findById(updateProductCommand.productId);
    const productToUpdate: Product = Product.factory.copy(foundProduct);
    productToUpdate.updateWith(updateProductCommand);
    await this.productRepository.save(productToUpdate);
  }
}
