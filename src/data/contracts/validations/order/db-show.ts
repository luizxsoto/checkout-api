import { OrderModel } from '@/domain/models'
import { ShowOrderUseCase } from '@/domain/use-cases'

export type ShowOrderValidation = (
  requestModel: ShowOrderUseCase.RequestModel
) => Promise<(validationData: { orders: OrderModel[] }) => Promise<void>>
