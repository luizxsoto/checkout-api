import { ListProductUseCase } from '@/domain/use-cases'

export type ListProductValidation = (requestModel: ListProductUseCase.RequestModel) => Promise<void>
