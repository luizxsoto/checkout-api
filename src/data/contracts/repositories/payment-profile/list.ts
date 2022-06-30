import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'customerId' | 'paymentMethod' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filters?: string;
};

export type ResponseModel = (Omit<PaymentProfileModel, 'data'> & {
  data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
})[];

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>;
}
