import { DbCreateUserUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { CreateUserUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { CompositeValidation } from '@/main/composites';
import { knexConfig } from '@/main/config';

export function makeDbCreateUserUseCase(session: SessionModel): CreateUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validationService = new CompositeValidation();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbCreateUserUseCase(
    repository,
    repository,
    validationService,
    bcryptCryptography,
  );

  return useCase;
}
