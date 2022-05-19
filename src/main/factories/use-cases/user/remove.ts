import { DbRemoveUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemoveUserUseCase(): RemoveUserUseCase.UseCase {
  const repository = new KnexUserRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemoveUserUseCase.RequestModel,
    { users: UserModel[] }
  >();
  const useCase = new DbRemoveUserUseCase(repository, repository, validatorService);

  return useCase;
}
