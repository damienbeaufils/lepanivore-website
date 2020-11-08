import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { parseAsync } from 'json2csv';
import { getDateAsIsoStringWithoutTime, parseDateWithTimeAtNoonUTC } from '../../domain/date.utils';
import { DeleteOrderCommand } from '../../domain/order/commands/delete-order-command';
import { NewOrderCommand } from '../../domain/order/commands/new-order-command';
import { UpdateOrderCommand } from '../../domain/order/commands/update-order-command';
import { getOrderTypeLabel, OrderType } from '../../domain/order/order-type';
import { OrderInterface } from '../../domain/order/order.interface';
import { ProductWithQuantity } from '../../domain/product/product-with-quantity';
import { OrderId } from '../../domain/type-aliases';
import { User } from '../../domain/user/user';
import { DeleteOrder } from '../../use_cases/delete-order';
import { GetOrders } from '../../use_cases/get-orders';
import { OrderProducts } from '../../use_cases/order-products';
import { UpdateExistingOrder } from '../../use_cases/update-existing-order';
import { JwtAuthGuard, Public } from '../config/authentication/jwt-auth-guard';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../use_cases_proxy/use-case-proxy';
import { GetOrderResponse } from './models/get-order-response';
import { PostOrderRequest } from './models/post-order-request';
import { PostOrderResponse } from './models/post-order-response';
import { PutOrderRequest } from './models/put-order-request';

@Controller('/api/orders')
export class OrderController {
  constructor(
    @Inject(ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE) private readonly getOrdersProxyService: UseCaseProxy<GetOrders>,
    @Inject(ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE) private readonly orderProductsProxyService: UseCaseProxy<OrderProducts>,
    @Inject(ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE)
    private readonly updateExistingOrderProxyService: UseCaseProxy<UpdateExistingOrder>,
    @Inject(ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE) private readonly deleteOrderProxyService: UseCaseProxy<DeleteOrder>
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Req() request: Request): Promise<GetOrderResponse[]> {
    const orders: OrderInterface[] = await this.getOrdersProxyService.getInstance().execute(request.user as User);

    return orders.map(
      (order: OrderInterface): GetOrderResponse => ({
        ...order,
        pickUpDate: getDateAsIsoStringWithoutTime(order.pickUpDate),
        deliveryDate: getDateAsIsoStringWithoutTime(order.deliveryDate),
        reservationDate: getDateAsIsoStringWithoutTime(order.reservationDate),
      })
    );
  }

  @Get('/csv')
  @UseGuards(JwtAuthGuard)
  async getOrdersAsCsv(@Req() request: Request): Promise<string> {
    const orders: OrderInterface[] = await this.getOrdersProxyService.getInstance().execute(request.user as User);
    const ordersAsCsvLines: OrderAsCsvLine[] = this.toOrderAsCsvLines(orders);

    request.res.contentType('text/csv');

    return ordersAsCsvLines.length > 0 ? parseAsync(ordersAsCsvLines, { fields: Object.keys(ordersAsCsvLines[0]) }) : '';
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @Public()
  async postOrder(@Body() postOrderRequest: PostOrderRequest, @Req() request: Request): Promise<PostOrderResponse> {
    const orderId: OrderId = await this.orderProductsProxyService
      .getInstance()
      .execute(request.user as User, this.toNewOrderCommand(postOrderRequest));

    request.res.location(`${request.route.path}/${orderId}`);

    return { id: orderId };
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  async putOrder(@Param('id') id: string, @Body() putOrderRequest: PutOrderRequest, @Req() request: Request): Promise<void> {
    await this.updateExistingOrderProxyService.getInstance().execute(request.user as User, this.toUpdateOrderCommand(id, putOrderRequest));
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteOrder(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.deleteOrderProxyService.getInstance().execute(request.user as User, this.toDeleteCommand(id));
  }

  private toNewOrderCommand(postOrderRequest: PostOrderRequest): NewOrderCommand {
    return {
      clientName: postOrderRequest.clientName,
      clientPhoneNumber: postOrderRequest.clientPhoneNumber,
      clientEmailAddress: postOrderRequest.clientEmailAddress,
      products: postOrderRequest.products,
      type: postOrderRequest.type as OrderType,
      pickUpDate: parseDateWithTimeAtNoonUTC(postOrderRequest.pickUpDate),
      deliveryDate: parseDateWithTimeAtNoonUTC(postOrderRequest.deliveryDate),
      deliveryAddress: postOrderRequest.deliveryAddress,
      reservationDate: parseDateWithTimeAtNoonUTC(postOrderRequest.reservationDate),
      note: postOrderRequest.note,
    };
  }

  private toUpdateOrderCommand(id: string, putOrderRequest: PutOrderRequest): UpdateOrderCommand {
    return {
      orderId: parseInt(id, 10),
      products: putOrderRequest.products,
      type: putOrderRequest.type as OrderType,
      pickUpDate: parseDateWithTimeAtNoonUTC(putOrderRequest.pickUpDate),
      deliveryDate: parseDateWithTimeAtNoonUTC(putOrderRequest.deliveryDate),
      deliveryAddress: putOrderRequest.deliveryAddress,
      reservationDate: parseDateWithTimeAtNoonUTC(putOrderRequest.reservationDate),
      note: putOrderRequest.note,
    };
  }

  private toDeleteCommand(id: string): DeleteOrderCommand {
    return { orderId: parseInt(id, 10) };
  }

  private toOrderAsCsvLines(orders: OrderInterface[]): OrderAsCsvLine[] {
    let ordersAsCsvLines: OrderAsCsvLine[] = [];
    orders.forEach((order: OrderInterface) => {
      ordersAsCsvLines = ordersAsCsvLines.concat(
        order.products.map((productWithQuantity: ProductWithQuantity) => this.toOrderAsCsvLine(order, productWithQuantity))
      );
    });

    return ordersAsCsvLines;
  }

  private toOrderAsCsvLine(order: OrderInterface, productWithQuantity: ProductWithQuantity): OrderAsCsvLine {
    return {
      orderId: order.id,
      clientName: order.clientName,
      clientPhoneNumber: order.clientPhoneNumber,
      clientEmailAddress: order.clientEmailAddress,
      product: productWithQuantity.product.name,
      quantity: productWithQuantity.quantity,
      type: getOrderTypeLabel(order.type),
      pickUpDate: getDateAsIsoStringWithoutTime(order.pickUpDate),
      deliveryDate: getDateAsIsoStringWithoutTime(order.deliveryDate),
      deliveryAddress: order.deliveryAddress,
      reservationDate: getDateAsIsoStringWithoutTime(order.reservationDate),
      note: order.note,
    };
  }
}

interface OrderAsCsvLine {
  orderId: OrderId;
  clientName: string;
  clientPhoneNumber: string;
  clientEmailAddress: string;
  product: string;
  quantity: number;
  type: string;
  pickUpDate?: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  reservationDate?: string;
  note?: string;
}
