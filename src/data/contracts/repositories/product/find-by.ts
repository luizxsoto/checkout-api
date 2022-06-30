import { ProductModel } from '@/domain/models';

export type RequestModel = Partial<ProductModel>[];

export type ResponseModel = ProductModel[];

export interface Repository {
  findBy: (requestModel: RequestModel) => Promise<ResponseModel>;
}
