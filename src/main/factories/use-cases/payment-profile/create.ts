import { DbCreatePaymentProfileUseCase } from '@/data/use-cases';
import { CustomerModel, PaymentProfileModel, SessionModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexCustomerRepository, KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreatePaymentProfileUseCase(
  session: SessionModel,
): CreatePaymentProfileUseCase.UseCase {
  const uuidService = new UUIDService();
  const repository = new KnexPaymentProfileRepository(session, knexConfig, uuidService);
  const customerRepository = new KnexCustomerRepository(session, knexConfig, uuidService);
  const validatorService = new VanillaValidatorService<
    CreatePaymentProfileUseCase.RequestModel,
    {
      customers: CustomerModel[];
      paymentProfiles: (Omit<PaymentProfileModel, 'data'> & {
        data: Omit<PaymentProfileModel['data'], 'number' | 'cvv'> & { number?: string };
      })[];
    }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbCreatePaymentProfileUseCase(
    repository,
    repository,
    customerRepository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
