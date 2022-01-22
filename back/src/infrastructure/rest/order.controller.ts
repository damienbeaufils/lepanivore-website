import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { parseAsync } from 'json2csv';
import { getDateAsIsoStringWithoutTime, parseDateWithTimeAtNoonUTC } from '../../domain/date.utils';
import { CheckOrderCommand } from '../../domain/order/commands/check-order-command';
import { DeleteOrderCommand } from '../../domain/order/commands/delete-order-command';
import { NewOrderCommand } from '../../domain/order/commands/new-order-command';
import { UncheckOrderCommand } from '../../domain/order/commands/uncheck-order-command';
import { UpdateOrderCommand } from '../../domain/order/commands/update-order-command';
import { getOrderTypeLabel, OrderType } from '../../domain/order/order-type';
import { OrderInterface } from '../../domain/order/order.interface';
import { ProductWithQuantity } from '../../domain/product/product-with-quantity';
import { OrderId } from '../../domain/type-aliases';
import { User } from '../../domain/user/user';
import { CheckOrder } from '../../use_cases/check-order';
import { DeleteOrder } from '../../use_cases/delete-order';
import { GetLastOrders } from '../../use_cases/get-last-orders';
import { GetOrders } from '../../use_cases/get-orders';
import { GetOrdersByDate } from '../../use_cases/get-orders-by-date';
import { OrderProducts } from '../../use_cases/order-products';
import { UncheckOrder } from '../../use_cases/uncheck-order';
import { UpdateExistingOrder } from '../../use_cases/update-existing-order';
import { JwtAuthGuard, Public } from '../config/authentication/jwt-auth-guard';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../use_cases_proxy/use-case-proxy';
import { GetOrderResponse } from './models/get-order-response';
import { PostOrderRequest } from './models/post-order-request';
import { PostOrderResponse } from './models/post-order-response';
import { PutOrderRequest } from './models/put-order-request';
import { GetOrderedProductsByDateRange } from '../../use_cases/get-ordered-products-by-date-range';
import { OrderedProductInterface } from '../../domain/order/ordered-product.interface';
import { GetOrderedProductResponse } from './models/get-ordered-product-response';

@Controller('/api/orders')
export class OrderController {
  constructor(
    @Inject(ProxyServicesDynamicModule.GET_ORDERS_PROXY_SERVICE) private readonly getOrdersProxyService: UseCaseProxy<GetOrders>,
    @Inject(ProxyServicesDynamicModule.GET_ORDERS_BY_DATE_PROXY_SERVICE) private readonly getOrdersByDateProxyService: UseCaseProxy<GetOrdersByDate>,
    @Inject(ProxyServicesDynamicModule.GET_LAST_ORDERS_PROXY_SERVICE) private readonly getLastOrdersProxyService: UseCaseProxy<GetLastOrders>,
    @Inject(ProxyServicesDynamicModule.GET_ORDERED_PRODUCTS_BY_DATE_RANGE_PROXY_SERVICE)
    private readonly getOrderedProductsByDateRangeProxyService: UseCaseProxy<GetOrderedProductsByDateRange>,
    @Inject(ProxyServicesDynamicModule.ORDER_PRODUCTS_PROXY_SERVICE) private readonly orderProductsProxyService: UseCaseProxy<OrderProducts>,
    @Inject(ProxyServicesDynamicModule.UPDATE_EXISTING_ORDER_PROXY_SERVICE)
    private readonly updateExistingOrderProxyService: UseCaseProxy<UpdateExistingOrder>,
    @Inject(ProxyServicesDynamicModule.DELETE_ORDER_PROXY_SERVICE) private readonly deleteOrderProxyService: UseCaseProxy<DeleteOrder>,
    @Inject(ProxyServicesDynamicModule.CHECK_ORDERED_PRODUCT_PROXY_SERVICE)
    private readonly checkOrderProxyService: UseCaseProxy<CheckOrder>,
    @Inject(ProxyServicesDynamicModule.UNCHECK_ORDERED_PRODUCT_PROXY_SERVICE)
    private readonly uncheckOrderProxyService: UseCaseProxy<UncheckOrder>
  ) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Req() request: Request): Promise<GetOrderResponse[]> {
    const year: number = request.query.year ? parseInt(request.query.year as string, 10) : undefined;
    const orders: OrderInterface[] = await this.getOrdersProxyService.getInstance().execute(request.user as User, year);

    return this.toGetOrderResponses(orders);
  }

  @Get('/date/:date')
  @UseGuards(JwtAuthGuard)
  async getOrdersByDate(@Param('date') date: string, @Req() request: Request): Promise<GetOrderResponse[]> {
    const orders: OrderInterface[] = await this.getOrdersByDateProxyService
      .getInstance()
      .execute(request.user as User, parseDateWithTimeAtNoonUTC(date));

    return this.toGetOrderResponses(orders);
  }

  @Get('/last/:numberOfOrders')
  @UseGuards(JwtAuthGuard)
  async getLastOrders(@Param('numberOfOrders') numberOfOrders: string, @Req() request: Request): Promise<GetOrderResponse[]> {
    const orders: OrderInterface[] = await this.getLastOrdersProxyService.getInstance().execute(request.user as User, parseInt(numberOfOrders, 10));

    return this.toGetOrderResponses(orders);
  }

  @Get('/products/:startDate/:endDate')
  @UseGuards(JwtAuthGuard)
  async getOrderedProductsByDateRange(
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Req() request: Request
  ): Promise<GetOrderedProductResponse[]> {
    const orderedProducts: OrderedProductInterface[] = await this.getOrderedProductsByDateRangeProxyService
      .getInstance()
      .execute(request.user as User, parseDateWithTimeAtNoonUTC(startDate), parseDateWithTimeAtNoonUTC(endDate));

    return orderedProducts as GetOrderedProductResponse[];
  }

  @Get('/csv')
  @UseGuards(JwtAuthGuard)
  async getOrdersAsCsv(@Req() request: Request): Promise<string> {
    const year: number = request.query.year ? parseInt(request.query.year as string, 10) : undefined;
    const orders: OrderInterface[] = await this.getOrdersProxyService.getInstance().execute(request.user as User, year);
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

  @Put('/:id/check')
  @UseGuards(JwtAuthGuard)
  async checkOrder(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.checkOrderProxyService.getInstance().execute(request.user as User, this.toCommandContainingOnlyOrderId(id));
  }

  @Put('/:id/uncheck')
  @UseGuards(JwtAuthGuard)
  async uncheckOrder(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.uncheckOrderProxyService.getInstance().execute(request.user as User, this.toCommandContainingOnlyOrderId(id));
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteOrder(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.deleteOrderProxyService.getInstance().execute(request.user as User, this.toCommandContainingOnlyOrderId(id));
  }

  private toGetOrderResponses(orders: OrderInterface[]): GetOrderResponse[] {
    return orders.map(
      (order: OrderInterface): GetOrderResponse => ({
        ...order,
        pickUpDate: getDateAsIsoStringWithoutTime(order.pickUpDate),
        deliveryDate: getDateAsIsoStringWithoutTime(order.deliveryDate),
        reservationDate: getDateAsIsoStringWithoutTime(order.reservationDate),
      })
    );
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

  private toCommandContainingOnlyOrderId(id: string): DeleteOrderCommand | CheckOrderCommand | UncheckOrderCommand {
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
