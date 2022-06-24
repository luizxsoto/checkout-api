import { DbShowUserUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowUserUseCase(session: SessionModel): ShowUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ShowUserUseCase.RequestModel,
    { users: UserModel[] }
  >();
  const useCase = new DbShowUserUseCase(repository, validatorService);

  return useCase;
}
