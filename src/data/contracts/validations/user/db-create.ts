import { UserModel } from '@/domain/models'
import { CreateUserUseCase } from '@/domain/use-cases'

export type CreateUserValidation = (
  requestModel: CreateUserUseCase.RequestModel
) => Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>>
