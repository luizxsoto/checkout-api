import { DbShowUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowUserUseCase(): ShowUserUseCase.UseCase {
  const repository = new KnexUserRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<ShowUserUseCase.RequestModel>,
    { users: UserModel[] }
  >();
  const useCase = new DbShowUserUseCase(repository, validatorService);

  return useCase;
}
