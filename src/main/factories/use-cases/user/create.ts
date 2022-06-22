import { DbCreateUserUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreateUserUseCase(session: SessionModel): CreateUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<CreateUserUseCase.RequestModel>,
    { users: UserModel[] }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbCreateUserUseCase(
    repository,
    repository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
