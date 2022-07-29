import { ListUserUseCase } from '@/domain/use-cases'

export type ListUserValidation = (requestModel: ListUserUseCase.RequestModel) => Promise<void>
