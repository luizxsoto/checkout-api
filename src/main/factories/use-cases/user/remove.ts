import { DbRemoveUserUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemoveUserUseCase(session: SessionModel): RemoveUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemoveUserUseCase.RequestModel,
    { users: Omit<UserModel, 'password'>[] }
  >();
  const useCase = new DbRemoveUserUseCase(repository, repository, validatorService);

  return useCase;
}
