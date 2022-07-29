import { ListOrderUseCase } from '@/domain/use-cases'

export type ListOrderValidation = (requestModel: ListOrderUseCase.RequestModel) => Promise<void>
