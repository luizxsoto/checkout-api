import { DbUpdateUserUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateUserUseCase(session: SessionModel): UpdateUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateUserUseCase.RequestModel,
    { users: Omit<UserModel, 'password'>[] }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbUpdateUserUseCase(
    repository,
    repository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
