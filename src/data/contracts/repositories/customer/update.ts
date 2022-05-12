import { CustomerModel } from '@/domain/models';

export type RequestModel = Parameters<
  (
    where: Partial<CustomerModel>,
    model: Partial<Omit<CustomerModel, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ) => void
>;

export type ResponseModel = CustomerModel;

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>;
}
