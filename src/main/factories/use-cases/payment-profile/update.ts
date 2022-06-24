import { DbUpdatePaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel, SessionModel } from '@/domain/models';
import { UpdatePaymentProfileUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdatePaymentProfileUseCase(
  session: SessionModel,
): UpdatePaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdatePaymentProfileUseCase.RequestModel,
    {
      paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
        data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
      })[];
    }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbUpdatePaymentProfileUseCase(
    repository,
    repository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
