import { OrderItemModel } from '@/domain/models'

export type RequestModel = {
  page?: number
  perPage?: number
  orderBy?: 'orderId' | 'productId' | 'unitValue' | 'totalValue' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  filters?: string
}

export type ResponseModel = {
  page: number
  perPage: number
  lastPage: number
  total: number
  registers: OrderItemModel[]
}

export interface Repository {
  list: (requestModel: RequestModel) => Promise<ResponseModel>
}
