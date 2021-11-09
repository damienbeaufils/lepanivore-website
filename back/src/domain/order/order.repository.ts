import { OrderId } from '../type-aliases';
import { OrderInterface } from './order.interface';

export interface OrderRepository {
  save(order: OrderInterface): Promise<OrderId>;
  delete(order: OrderInterface): Promise<void>;
  findById(orderId: OrderId): Promise<OrderInterface>;
  findAll(): Promise<OrderInterface[]>;
  findAllByYear(year: number): Promise<OrderInterface[]>;
  findAllByDate(date: Date): Promise<OrderInterface[]>;
}
