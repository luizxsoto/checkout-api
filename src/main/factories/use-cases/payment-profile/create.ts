import { DbCreatePaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel, SessionModel, UserModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexPaymentProfileRepository, KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreatePaymentProfileUseCase(
  session: SessionModel,
): CreatePaymentProfileUseCase.UseCase {
  const uuidService = new UUIDService();
  const repository = new KnexPaymentProfileRepository(session, knexConfig, uuidService);
  const userRepository = new KnexUserRepository(session, knexConfig, uuidService);
  const validatorService = new VanillaValidatorService<
    CreatePaymentProfileUseCase.RequestModel,
    {
      users: Omit<UserModel, 'password'>[];
      paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[];
    }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbCreatePaymentProfileUseCase(
    repository,
    repository,
    userRepository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
