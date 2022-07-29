import { ProductModel } from '@/domain/models'

export type RequestModel = Parameters<(where: Partial<ProductModel>) => void>

export type ResponseModel = ProductModel[]

export interface Repository {
  remove: (...requestModel: RequestModel) => Promise<ResponseModel>
}
