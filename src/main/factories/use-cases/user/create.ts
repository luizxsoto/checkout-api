import { DbCreateUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateUserUseCase(): CreateUserUseCase.UseCase {
  const repository = new KnexUserRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<CreateUserUseCase.RequestModel>,
    { users: UserModel[] }
  >();
  const useCase = new DbCreateUserUseCase(repository, repository, validatorService);

  return useCase;
}
