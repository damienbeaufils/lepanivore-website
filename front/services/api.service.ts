import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosError } from 'axios';
import { ClosingPeriodId, OrderId, ProductId } from '../../back/src/domain/type-aliases';
import { GetClosingPeriodResponse } from '../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetOrderResponse } from '../../back/src/infrastructure/rest/models/get-order-response';
import { GetProductOrderingResponse } from '../../back/src/infrastructure/rest/models/get-product-ordering-response';
import { GetProductResponse } from '../../back/src/infrastructure/rest/models/get-product-response';
import { PostClosingPeriodRequest } from '../../back/src/infrastructure/rest/models/post-closing-period-request';
import { PostClosingPeriodResponse } from '../../back/src/infrastructure/rest/models/post-closing-period-response';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PostOrderResponse } from '../../back/src/infrastructure/rest/models/post-order-response';
import { PostProductRequest } from '../../back/src/infrastructure/rest/models/post-product-request';
import { PostProductResponse } from '../../back/src/infrastructure/rest/models/post-product-response';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';
import { PutProductRequest } from '../../back/src/infrastructure/rest/models/put-product-request';

export default class ApiService {
  private readonly $axios: NuxtAxiosInstance;

  constructor($axios: NuxtAxiosInstance) {
    this.attachResponseInterceptors($axios);
    this.$axios = $axios;
  }

  getOrders(year?: number): Promise<GetOrderResponse[]> {
    const url: string = year ? `/api/orders?year=${year}` : '/api/orders';

    return this.$axios.$get(url);
  }

  getOrdersAsCsv(year?: number): Promise<string> {
    const url: string = year ? `/api/orders/csv?year=${year}` : '/api/orders/csv';

    return this.$axios.$get(url);
  }

  postOrder(postOrderRequest: PostOrderRequest): Promise<PostOrderResponse> {
    return this.$axios.$post('/api/orders', postOrderRequest);
  }

  putOrder(id: OrderId, putOrderRequest: PutOrderRequest): Promise<void> {
    return this.$axios.$put(`/api/orders/${id}`, putOrderRequest);
  }

  deleteOrder(id: OrderId): Promise<void> {
    return this.$axios.$delete(`/api/orders/${id}`);
  }

  getProducts(): Promise<GetProductResponse[]> {
    return this.$axios.$get('/api/products');
  }

  postProduct(postProductRequest: PostProductRequest): Promise<PostProductResponse> {
    return this.$axios.$post('/api/products', postProductRequest);
  }

  putProduct(id: ProductId, putProductRequest: PutProductRequest): Promise<void> {
    return this.$axios.$put(`/api/products/${id}`, putProductRequest);
  }

  deleteProduct(id: ProductId): Promise<void> {
    return this.$axios.$delete(`/api/products/${id}`);
  }

  getClosingPeriods(): Promise<GetClosingPeriodResponse[]> {
    return this.$axios.$get('/api/closing-periods');
  }

  postClosingPeriod(postClosingPeriodRequest: PostClosingPeriodRequest): Promise<PostClosingPeriodResponse> {
    return this.$axios.$post('/api/closing-periods', postClosingPeriodRequest);
  }

  deleteClosingPeriod(id: ClosingPeriodId): Promise<void> {
    return this.$axios.$delete(`/api/closing-periods/${id}`);
  }

  getProductOrdering(): Promise<GetProductOrderingResponse> {
    return this.$axios.$get('/api/product-ordering/status');
  }

  putProductOrderingEnable(): Promise<void> {
    return this.$axios.$put('/api/product-ordering/enable');
  }

  putProductOrderingDisable(): Promise<void> {
    return this.$axios.$put('/api/product-ordering/disable');
  }

  private attachResponseInterceptors($axios: NuxtAxiosInstance): void {
    $axios.interceptors.response.use(undefined, (error: AxiosError) => {
      return Promise.reject(error && error.response && error.response.data);
    });
  }
}
