import { DbCreateSessionUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { CreateSessionUseCase } from '@/domain/use-cases';
import { BcryptCryptography, JwtCryptography } from '@/infra/cryptography';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { envConfig, knexConfig } from '@/main/config';

export function makeDbCreateSessionUseCase(): CreateSessionUseCase.UseCase {
  const repository = new KnexUserRepository({} as SessionModel, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<CreateSessionUseCase.RequestModel>,
    { users: UserModel[] }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const jwtCryptography = new JwtCryptography(envConfig.jwtSecret);
  const useCase = new DbCreateSessionUseCase(
    repository,
    bcryptCryptography,
    jwtCryptography,
    validatorService,
  );

  return useCase;
}
