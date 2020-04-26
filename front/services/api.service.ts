import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { AxiosError } from 'axios';
import { OrderId } from '../../back/src/domain/type-aliases';
import { GetClosingPeriodResponse } from '../../back/src/infrastructure/rest/models/get-closing-period-response';
import { GetOrderResponse } from '../../back/src/infrastructure/rest/models/get-order-response';
import { GetProductResponse } from '../../back/src/infrastructure/rest/models/get-product-response';
import { PostOrderRequest } from '../../back/src/infrastructure/rest/models/post-order-request';
import { PostOrderResponse } from '../../back/src/infrastructure/rest/models/post-order-response';
import { PutOrderRequest } from '../../back/src/infrastructure/rest/models/put-order-request';

export default class ApiService {
  private readonly $axios: NuxtAxiosInstance;

  constructor($axios: NuxtAxiosInstance) {
    this.attachResponseInterceptors($axios);
    this.$axios = $axios;
  }

  getOrders(): Promise<GetOrderResponse[]> {
    return this.$axios.$get('/api/orders');
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

  getClosingPeriods(): Promise<GetClosingPeriodResponse[]> {
    return this.$axios.$get('/api/closing-periods');
  }

  getProducts(): Promise<GetProductResponse[]> {
    return this.$axios.$get('/api/products');
  }

  private attachResponseInterceptors($axios: NuxtAxiosInstance): void {
    $axios.interceptors.response.use(undefined, (error: AxiosError) => {
      return Promise.reject(error && error.response && error.response.data);
    });
  }
}
