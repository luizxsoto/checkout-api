import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = {
  pege?: number;
  perPage?: number;
  orderBy?: string;
  order?: string;
  filters?: string;
};

export type ResponseModel = (Omit<PaymentProfileModel, 'data'> & {
  data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
})[];

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>;
}
