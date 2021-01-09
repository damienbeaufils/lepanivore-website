import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import ApiService from '~/services/api.service';
import { FeatureStatus } from '../../../back/src/domain/feature/feature-status';
import { ClosingPeriodId, OrderId, ProductId } from '../../../back/src/domain/type-aliases';
import { GetClosingPeriodResponse } from '../../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetOrderResponse } from '../../../back/src/infrastructure/rest/models/get-order-response';
import { GetProductOrderingResponse } from '../../../back/src/infrastructure/rest/models/get-product-ordering-response';
import { GetProductResponse } from '../../../back/src/infrastructure/rest/models/get-product-response';
import { PostClosingPeriodRequest } from '../../../back/src/infrastructure/rest/models/post-closing-period-request';
import { PostClosingPeriodResponse } from '../../../back/src/infrastructure/rest/models/post-closing-period-response';
import { PostOrderRequest } from '../../../back/src/infrastructure/rest/models/post-order-request';
import { PostOrderResponse } from '../../../back/src/infrastructure/rest/models/post-order-response';
import { PostProductRequest } from '../../../back/src/infrastructure/rest/models/post-product-request';
import { PostProductResponse } from '../../../back/src/infrastructure/rest/models/post-product-response';
import { PutOrderRequest } from '../../../back/src/infrastructure/rest/models/put-order-request';
import { PutProductRequest } from '../../../back/src/infrastructure/rest/models/put-product-request';

describe('services/ApiService', () => {
  let apiService: ApiService;
  let $get: jest.Mock;
  let $post: jest.Mock;
  let $put: jest.Mock;
  let $delete: jest.Mock;
  let useMock: jest.Mock;

  beforeEach(() => {
    $get = jest.fn();
    $post = jest.fn();
    $put = jest.fn();
    $delete = jest.fn();
    useMock = jest.fn();
    const $axios: object = { $get, $post, $put, $delete, interceptors: { response: { use: useMock } } };
    const mockAxios: NuxtAxiosInstance = $axios as NuxtAxiosInstance;
    apiService = new ApiService(mockAxios);
  });

  describe('constructor()', () => {
    it('should call use methods of response interceptor with undefined onFulfilled callback', () => {
      // then
      expect(useMock).toHaveBeenCalled();
      expect(useMock.mock.calls[0][0]).toBeUndefined();
    });
    it('should call use methods of response interceptor with defined onRejected callback that return data from error', () => {
      // given
      const rejectCallback: (error: AxiosError) => Promise<unknown> = useMock.mock.calls[0][1];
      const error: AxiosError = {} as AxiosError;
      error.response = { data: 'An error data' } as AxiosResponse;

      // when
      const result: Promise<unknown> = rejectCallback(error);

      // then
      expect(result).rejects.toBe('An error data');
    });
  });

  describe('getOrders()', () => {
    it('should get orders from api', async () => {
      // when
      await apiService.getOrders();

      // then
      expect($get).toHaveBeenCalledWith('/api/orders');
    });
    it('should get orders from api with year as query param when given', async () => {
      // given
      const year: number = 2021;

      // when
      await apiService.getOrders(year);

      // then
      expect($get).toHaveBeenCalledWith('/api/orders?year=2021');
    });
    it('should return orders', async () => {
      // given
      const response: GetOrderResponse[] = [{ id: 1, clientName: 'fake order 1' } as GetOrderResponse];
      $get.mockReturnValue(Promise.resolve(response));

      // when
      const result: GetOrderResponse[] = await apiService.getOrders();

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('getOrdersAsCsv()', () => {
    it('should get orders as csv from api', async () => {
      // when
      await apiService.getOrdersAsCsv();

      // then
      expect($get).toHaveBeenCalledWith('/api/orders/csv');
    });
    it('should get orders as csv from api with year as query param when given', async () => {
      // given
      const year: number = 2021;

      // when
      await apiService.getOrdersAsCsv(year);

      // then
      expect($get).toHaveBeenCalledWith('/api/orders/csv?year=2021');
    });
    it('should return orders', async () => {
      // given
      const response: string = 'a csv file content';
      $get.mockReturnValue(Promise.resolve(response));

      // when
      const result: string = await apiService.getOrdersAsCsv();

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('postOrder()', () => {
    it('should post order to api', async () => {
      // given
      const request: PostOrderRequest = { clientName: 'fake client' } as PostOrderRequest;

      // when
      await apiService.postOrder(request);

      // then
      expect($post).toHaveBeenCalledWith('/api/orders', request);
    });
    it('should return order id', async () => {
      // given
      const request: PostOrderRequest = { clientName: 'fake client' } as PostOrderRequest;
      const response: PostOrderResponse = { id: 1337 };
      $post.mockReturnValue(Promise.resolve(response));

      // when
      const result: PostOrderResponse = await apiService.postOrder(request);

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('putOrder()', () => {
    it('should put order to api', async () => {
      // given
      const orderId: OrderId = 42;
      const request: PutOrderRequest = { deliveryAddress: 'another delivery address' } as PutOrderRequest;

      // when
      await apiService.putOrder(orderId, request);

      // then
      expect($put).toHaveBeenCalledWith('/api/orders/42', request);
    });
  });

  describe('deleteOrder()', () => {
    it('should delete order to api', async () => {
      // given
      const orderId: OrderId = 42;

      // when
      await apiService.deleteOrder(orderId);

      // then
      expect($delete).toHaveBeenCalledWith('/api/orders/42');
    });
  });

  describe('getProducts()', () => {
    it('should get products from api', async () => {
      // when
      await apiService.getProducts();

      // then
      expect($get).toHaveBeenCalledWith('/api/products');
    });
    it('should return products', async () => {
      // given
      const response: GetProductResponse[] = [{ id: 1, name: 'fake product 1' } as GetProductResponse];
      $get.mockReturnValue(Promise.resolve(response));

      // when
      const result: GetProductResponse[] = await apiService.getProducts();

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('postProduct()', () => {
    it('should post product to api', async () => {
      // given
      const request: PostProductRequest = { name: 'fake product' } as PostProductRequest;

      // when
      await apiService.postProduct(request);

      // then
      expect($post).toHaveBeenCalledWith('/api/products', request);
    });
    it('should return product id', async () => {
      // given
      const request: PostProductRequest = { name: 'fake product' } as PostProductRequest;
      const response: PostProductResponse = { id: 1337 };
      $post.mockReturnValue(Promise.resolve(response));

      // when
      const result: PostProductResponse = await apiService.postProduct(request);

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('putProduct()', () => {
    it('should put product to api', async () => {
      // given
      const productId: ProductId = 42;
      const request: PutProductRequest = { description: 'new description' } as PutProductRequest;

      // when
      await apiService.putProduct(productId, request);

      // then
      expect($put).toHaveBeenCalledWith('/api/products/42', request);
    });
  });

  describe('deleteProduct()', () => {
    it('should delete product to api', async () => {
      // given
      const productId: ProductId = 42;

      // when
      await apiService.deleteProduct(productId);

      // then
      expect($delete).toHaveBeenCalledWith('/api/products/42');
    });
  });

  describe('getClosingPeriods()', () => {
    it('should get closing periods from api', async () => {
      // when
      await apiService.getClosingPeriods();

      // then
      expect($get).toHaveBeenCalledWith('/api/closing-periods');
    });
    it('should return closing periods', async () => {
      // given
      const response: GetClosingPeriodResponse[] = [
        {
          id: 1,
          startDate: '2020-04-09T00:00:00Z',
          endDate: '2020-04-20T00:00:00Z',
        },
      ];
      $get.mockReturnValue(Promise.resolve(response));

      // when
      const result: GetClosingPeriodResponse[] = await apiService.getClosingPeriods();

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('postClosingPeriod()', () => {
    it('should post closing period to api', async () => {
      // given
      const request: PostClosingPeriodRequest = { startDate: '2020-04-09T00:00:00Z' } as PostClosingPeriodRequest;

      // when
      await apiService.postClosingPeriod(request);

      // then
      expect($post).toHaveBeenCalledWith('/api/closing-periods', request);
    });
    it('should return closing period id', async () => {
      // given
      const request: PostClosingPeriodRequest = { startDate: '2020-04-09T00:00:00Z' } as PostClosingPeriodRequest;
      const response: PostClosingPeriodResponse = { id: 1337 };
      $post.mockReturnValue(Promise.resolve(response));

      // when
      const result: PostClosingPeriodResponse = await apiService.postClosingPeriod(request);

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('deleteClosingPeriod()', () => {
    it('should delete closing period to api', async () => {
      // given
      const closingPeriodId: ClosingPeriodId = 42;

      // when
      await apiService.deleteClosingPeriod(closingPeriodId);

      // then
      expect($delete).toHaveBeenCalledWith('/api/closing-periods/42');
    });
  });

  describe('getProductOrdering()', () => {
    it('should get product ordering status from api', async () => {
      // when
      await apiService.getProductOrdering();

      // then
      expect($get).toHaveBeenCalledWith('/api/product-ordering/status');
    });
    it('should return product ordering feature', async () => {
      // given
      const response: GetProductOrderingResponse = { id: 1, name: 'PRODUCT_ORDERING', status: FeatureStatus.ENABLED };
      $get.mockReturnValue(Promise.resolve(response));

      // when
      const result: GetProductOrderingResponse = await apiService.getProductOrdering();

      // then
      expect(result).toStrictEqual(response);
    });
  });

  describe('putProductOrderingEnable()', () => {
    it('should put enable product ordering to api', async () => {
      // when
      await apiService.putProductOrderingEnable();

      // then
      expect($put).toHaveBeenCalledWith('/api/product-ordering/enable');
    });
  });

  describe('putProductOrderingDisable()', () => {
    it('should put enable product ordering to api', async () => {
      // when
      await apiService.putProductOrderingDisable();

      // then
      expect($put).toHaveBeenCalledWith('/api/product-ordering/disable');
    });
  });
});
