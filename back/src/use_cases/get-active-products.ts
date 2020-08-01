import { ProductStatus } from '../domain/product/product-status';
import { ProductInterface } from '../domain/product/product.interface';
import { ProductRepository } from '../domain/product/product.repository';

export class GetActiveProducts {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<ProductInterface[]> {
    return this.productRepository.findAllByStatus(ProductStatus.ACTIVE);
  }
}
