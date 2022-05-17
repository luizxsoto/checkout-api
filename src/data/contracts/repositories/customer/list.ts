import { CustomerModel } from '@/domain/models';

export type RequestModel = {
  pege?: number;
  perPage?: number;
  orderBy?: string;
  order?: string;
} & Partial<CustomerModel>;

export type ResponseModel = CustomerModel[];

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>;
}
