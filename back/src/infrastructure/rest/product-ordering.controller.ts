import { Controller, Get, Inject, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../../domain/user/user';
import { DisableProductOrdering } from '../../use_cases/disable-product-ordering';
import { EnableProductOrdering } from '../../use_cases/enable-product-ordering';
import { GetProductOrderingStatus } from '../../use_cases/get-product-ordering-status';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../use_cases_proxy/use-case-proxy';
import { GetProductOrderingResponse } from './models/get-product-ordering-response';

@Controller('/api/product-ordering')
export class ProductOrderingController {
  constructor(
    @Inject(ProxyServicesDynamicModule.GET_PRODUCT_ORDERING_STATUS_PROXY_SERVICE)
    private readonly getProductOrderingStatusProxyService: UseCaseProxy<GetProductOrderingStatus>,
    @Inject(ProxyServicesDynamicModule.ENABLE_PRODUCT_ORDERING_PROXY_SERVICE)
    private readonly enableProductOrderingProxyService: UseCaseProxy<EnableProductOrdering>,
    @Inject(ProxyServicesDynamicModule.DISABLE_PRODUCT_ORDERING_PROXY_SERVICE)
    private readonly disableProductOrderingProxyService: UseCaseProxy<DisableProductOrdering>
  ) {}

  @Get('/status')
  async getProductOrderingStatus(): Promise<GetProductOrderingResponse> {
    return this.getProductOrderingStatusProxyService.getInstance().execute();
  }

  @Put('/enable')
  @UseGuards(AuthGuard('jwt'))
  async putEnableProductOrdering(@Req() request: Request): Promise<void> {
    return this.enableProductOrderingProxyService.getInstance().execute(request.user as User);
  }

  @Put('/disable')
  @UseGuards(AuthGuard('jwt'))
  async putDisableProductOrdering(@Req() request: Request): Promise<void> {
    return this.disableProductOrderingProxyService.getInstance().execute(request.user as User);
  }
}
