import { ProductModel } from '@/domain/models'

export type RequestModel = {
  page?: number
  perPage?: number
  orderBy?: 'name' | 'category' | 'price' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  filters?: string
}

export type ResponseModel = ProductModel[]

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
