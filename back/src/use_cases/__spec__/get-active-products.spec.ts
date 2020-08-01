import { Product } from '../../domain/product/product';
import { ProductStatus } from '../../domain/product/product-status';
import { ProductInterface } from '../../domain/product/product.interface';
import { ProductRepository } from '../../domain/product/product.repository';
import { GetActiveProducts } from '../get-active-products';

describe('use_cases/GetActiveProducts', () => {
  let getActiveProducts: GetActiveProducts;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    mockProductRepository = {} as ProductRepository;
    mockProductRepository.findAllByStatus = jest.fn();

    getActiveProducts = new GetActiveProducts(mockProductRepository);
  });

  describe('execute()', () => {
    it('should find active products', async () => {
      // when
      await getActiveProducts.execute();

      // then
      expect(mockProductRepository.findAllByStatus).toHaveBeenCalledWith(ProductStatus.ACTIVE);
    });

    it('should return found products', async () => {
      // given
      const products: Product[] = [
        { id: 1, name: 'fake product 1' } as Product,
        {
          id: 2,
          name: 'fake product 2',
        } as Product,
      ];
      (mockProductRepository.findAllByStatus as jest.Mock).mockReturnValue(Promise.resolve(products));

      // when
      const result: ProductInterface[] = await getActiveProducts.execute();

      // then
      expect(result).toStrictEqual(products);
    });
  });
});
