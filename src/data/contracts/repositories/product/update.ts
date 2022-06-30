import { ProductModel } from '@/domain/models';

export type RequestModel = Parameters<
  (
    where: Partial<ProductModel>,
    model: Partial<
      Omit<
        ProductModel,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      >
    >,
  ) => void
>;

export type ResponseModel = ProductModel[];

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>;
}
