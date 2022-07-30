import { ProductModel } from '@/domain/models'

export type RequestModel = {
  page?: number
  perPage?: number
  orderBy?: 'name' | 'category' | 'price' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  filters?: string
}

export type ResponseModel = {
  page: number
  perPage: number
  lastPage: number
  total: number
  registers: ProductModel[]
}

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
