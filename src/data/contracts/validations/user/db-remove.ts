import { UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';

export type RemoveUserValidation = (
  requestModel: RemoveUserUseCase.RequestModel,
) => Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>>;
