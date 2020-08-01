import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ClosingPeriodInterface } from '../../domain/closing-period/closing-period.interface';
import { DeleteClosingPeriodCommand } from '../../domain/closing-period/commands/delete-closing-period-command';
import { NewClosingPeriodCommand } from '../../domain/closing-period/commands/new-closing-period-command';
import { getDateAsIsoStringWithoutTime, parseDateWithTimeAtNoonUTC } from '../../domain/date.utils';
import { ClosingPeriodId } from '../../domain/type-aliases';
import { User } from '../../domain/user/user';
import { AddNewClosingPeriod } from '../../use_cases/add-new-closing-period';
import { DeleteClosingPeriod } from '../../use_cases/delete-closing-period';
import { GetClosingPeriods } from '../../use_cases/get-closing-periods';
import { JwtAuthGuard } from '../config/authentication/jwt-auth-guard';
import { ProxyServicesDynamicModule } from '../use_cases_proxy/proxy-services-dynamic.module';
import { UseCaseProxy } from '../use_cases_proxy/use-case-proxy';
import { GetClosingPeriodResponse } from './models/get-closing-period-response';
import { PostClosingPeriodRequest } from './models/post-closing-period-request';
import { PostClosingPeriodResponse } from './models/post-closing-period-response';

@Controller('/api/closing-periods')
export class ClosingPeriodController {
  constructor(
    @Inject(ProxyServicesDynamicModule.GET_CLOSING_PERIODS_PROXY_SERVICE)
    private readonly getClosingPeriodsProxyService: UseCaseProxy<GetClosingPeriods>,
    @Inject(ProxyServicesDynamicModule.ADD_NEW_CLOSING_PERIOD_PROXY_SERVICE)
    private readonly addNewClosingPeriodProxyService: UseCaseProxy<AddNewClosingPeriod>,
    @Inject(ProxyServicesDynamicModule.DELETE_CLOSING_PERIOD_PROXY_SERVICE)
    private readonly deleteClosingPeriodProxyService: UseCaseProxy<DeleteClosingPeriod>
  ) {}

  @Get('/')
  async getClosingPeriods(): Promise<GetClosingPeriodResponse[]> {
    const closingPeriods: ClosingPeriodInterface[] = await this.getClosingPeriodsProxyService.getInstance().execute();

    return closingPeriods.map(
      (closingPeriod: ClosingPeriodInterface) =>
        ({
          id: closingPeriod.id,
          startDate: getDateAsIsoStringWithoutTime(closingPeriod.startDate),
          endDate: getDateAsIsoStringWithoutTime(closingPeriod.endDate),
        } as GetClosingPeriodResponse)
    );
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  async postOrder(@Body() postClosingPeriodRequest: PostClosingPeriodRequest, @Req() request: Request): Promise<PostClosingPeriodResponse> {
    const closingPeriodId: ClosingPeriodId = await this.addNewClosingPeriodProxyService
      .getInstance()
      .execute(request.user as User, this.toNewClosingPeriodCommand(postClosingPeriodRequest));

    request.res.location(`${request.route.path}/${closingPeriodId}`);

    return { id: closingPeriodId };
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async deleteClosingPeriod(@Param('id') id: string, @Req() request: Request): Promise<void> {
    await this.deleteClosingPeriodProxyService.getInstance().execute(request.user as User, this.toDeleteCommand(id));
  }

  private toNewClosingPeriodCommand(postClosingPeriodRequest: PostClosingPeriodRequest): NewClosingPeriodCommand {
    return {
      startDate: parseDateWithTimeAtNoonUTC(postClosingPeriodRequest.startDate),
      endDate: parseDateWithTimeAtNoonUTC(postClosingPeriodRequest.endDate),
    };
  }

  private toDeleteCommand(id: string): DeleteClosingPeriodCommand {
    return { closingPeriodId: parseInt(id, 10) };
  }
}
