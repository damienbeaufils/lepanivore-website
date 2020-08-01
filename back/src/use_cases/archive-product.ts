import { ArchiveProductCommand } from '../domain/product/commands/archive-product-command';
import { Product } from '../domain/product/product';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';
import { InvalidUserError } from '../domain/user/errors/invalid-user.error';
import { isAdmin, User } from '../domain/user/user';

export class ArchiveProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(user: User, archiveProductCommand: ArchiveProductCommand): Promise<void> {
    if (!isAdmin(user)) {
      return Promise.reject(new InvalidUserError('User has to be ADMIN to execute this action'));
    }

    const existingProduct: ProductInterface = await this.productRepository.findById(archiveProductCommand.productId);
    const productToArchive: Product = Product.factory.copy(existingProduct);
    productToArchive.archive();
    await this.productRepository.save(productToArchive);
  }
}
