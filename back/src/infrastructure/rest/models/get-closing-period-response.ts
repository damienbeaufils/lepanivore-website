import { ClosingPeriodId } from '../../../domain/type-aliases';

export interface GetClosingPeriodResponse {
  id: ClosingPeriodId;
  startDate: string;
  endDate: string;
}
