import { ProductModel } from '@/domain/models'

export type RequestModel = Omit<
  ProductModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

export type ResponseModel = ProductModel

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
