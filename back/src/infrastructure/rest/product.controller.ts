import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ArchiveProductCommand } from '../../domain/product/commands/archive-product-command';
import { NewProductCommand } from '../../domain/product/commands/new-product-command';
import { UpdateProductCommand } from '../../domain/product/commands/update-product-command';
import { ProductId } from '../../domain/type-aliases';
import { User } from '../../domain/user/user';
import { AddNewProduct } from '../../use_cases/add-new-product';
import { ArchiveProduct } from '../../use_cases/archive-product';
import { GetActiveProducts } from '../../use_cases/get-active-products';
import { UpdateExistingProduct } from '../../use_cases/update-existing-product';
import { JwtAuthGuard } from '../config/authentication/jwt-auth-guard';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../use_cases_proxy/use-case-proxy';
import { GetProductResponse } from './models/get-product-response';
import { PostProductRequest } from './models/post-product-request';
import { PostProductResponse } from './models/post-product-response';
import { PutProductRequest } from './models/put-product-request';

@Controller('/api/products')
export class ProductController {
  constructor(
    @Inject(ProxyServicesDynamicModule.GET_ACTIVE_PRODUCTS_PROXY_SERVICE)
    private readonly getActiveProductsProxyService: UseCaseProxy<GetActiveProducts>,
    @Inject(ProxyServicesDynamicModule.ADD_NEW_PRODUCT_PROXY_SERVICE)
    private readonly addNewProductProxyService: UseCaseProxy<AddNewProduct>,
    @Inject(ProxyServicesDynamicModule.UPDATE_EXISTING_PRODUCT_PROXY_SERVICE)
    private readonly updateExistingProductProxyService: UseCaseProxy<UpdateExistingProduct>,
    @Inject(ProxyServicesDynamicModule.ARCHIVE_PRODUCT_PROXY_SERVICE)
    private readonly archiveProductProxyService: UseCaseProxy<ArchiveProduct>
  ) {}

  @Get('/')
  async getProducts(): Promise<GetProductResponse[]> {
    return this.getActiveProductsProxyService.getInstance().execute();
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  async postProduct(@Body() postProductRequest: PostProductRequest, @Req() request: Request): Promise<PostProductResponse> {
    const productId: ProductId = await this.addNewProductProxyService
      .getInstance()
      .execute(request.user as User, this.toNewProductCommand(postProductRequest));

    request.res.location(`${request.route.path}/${productId}`);

    return { id: productId };
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  async putProduct(@Param('id') id: string, @Body() putProductRequest: PutProductRequest, @Req() request: Request): Promise<void> {
    await this.updateExistingProductProxyService.getInstance().execute(request.user as User, this.toUpdateProductCommand(id, putProductRequest));
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.archiveProductProxyService.getInstance().execute(request.user as User, this.toArchiveCommand(id));
  }

  private toNewProductCommand(postProductRequest: PostProductRequest): NewProductCommand {
    return {
      name: postProductRequest.name,
      description: postProductRequest.description,
      price: postProductRequest.price,
    };
  }

  private toUpdateProductCommand(id: string, putProductRequest: PutProductRequest): UpdateProductCommand {
    return {
      productId: parseInt(id, 10),
      description: putProductRequest.description,
    };
  }

  private toArchiveCommand(id: string): ArchiveProductCommand {
    return { productId: parseInt(id, 10) };
  }
}
