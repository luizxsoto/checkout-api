import { UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';

export type UpdateUserValidation = (
  requestModel: UpdateUserUseCase.RequestModel,
) => Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>>;
