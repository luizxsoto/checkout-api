import { UserModel } from '@/domain/models';
import { CreateSessionUseCase } from '@/domain/use-cases';

export type CreateSessionValidation = (
  requestModel: CreateSessionUseCase.RequestModel,
) => Promise<
  (validationData: { users: UserModel[] }) => Promise<(findedUser: UserModel) => Promise<void>>
>;
