import { Controller, Get, Logger, LoggerService } from '@nestjs/common';
import { OrderInterface } from '../../domain/order/order.interface';
import { Public } from '../config/authentication/jwt-auth-guard';
import { DatabaseOrderRepository } from '../repositories/database-order.repository';
import { performance } from 'perf_hooks';

// TODO REMOVE ME WHEN ALL PERSONAL DATA ARE ENCRYPTED
@Controller('/api/encrypt')
export class EncryptionController {
  private readonly LOGGER: LoggerService = new Logger(EncryptionController.name);

  constructor(private readonly databaseOrderRepository: DatabaseOrderRepository) {}

  @Get('1')
  @Public()
  async encrypt1(): Promise<void> {
    await this.encryptOrders(1, 500);
  }

  @Get('2')
  @Public()
  async encrypt2(): Promise<void> {
    await this.encryptOrders(501, 1000);
  }

  @Get('3')
  @Public()
  async encrypt3(): Promise<void> {
    await this.encryptOrders(1001, 1500);
  }

  @Get('4')
  @Public()
  async encrypt4(): Promise<void> {
    await this.encryptOrders(1501, 2000);
  }

  @Get('5')
  @Public()
  async encrypt5(): Promise<void> {
    await this.encryptOrders(2001, 2500);
  }

  @Get('6')
  @Public()
  async encrypt6(): Promise<void> {
    await this.encryptOrders(2501, 3000);
  }

  private async encryptOrders(startFrom: number, endAtInclusive: number): Promise<void> {
    const startTime: DOMHighResTimeStamp = performance.now();

    for (let i: number = startFrom; i <= endAtInclusive; i++) {
      try {
        const order: OrderInterface = await this.databaseOrderRepository.findById(i);
        await this.databaseOrderRepository.save(order);
        this.LOGGER.log(`Order id ${order.id} encrypted`);
      } catch (e) {
        this.LOGGER.log(e);
      }
    }

    const endTime: DOMHighResTimeStamp = performance.now();
    this.LOGGER.log(`Encryption from order id ${startFrom} to ${endAtInclusive} inclusive took ${endTime - startTime} milliseconds`);
  }
}
