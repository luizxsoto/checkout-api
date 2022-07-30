import { OrderModel } from '@/domain/models'

export type RequestModel = {
  page?: number
  perPage?: number
  orderBy?: 'userId' | 'totalValue' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  filters?: string
}

export type ResponseModel = {
  page: number
  perPage: number
  lastPage: number
  total: number
  registers: OrderModel[]
}

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>
}
