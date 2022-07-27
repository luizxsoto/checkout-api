import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'userId' | 'type' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filters?: string;
};

export type ResponseModel = Omit<PaymentProfileModel, 'number' | 'cvv'>[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
