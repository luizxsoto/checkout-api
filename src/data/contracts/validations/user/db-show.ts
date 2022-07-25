import { UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';

export type ShowUserValidation = (
  requestModel: ShowUserUseCase.RequestModel,
) => Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>>;
