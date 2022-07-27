import { DbRemovePaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel, SessionModel } from '@/domain/models';
import { RemovePaymentProfileUseCase } from '@/domain/use-cases';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbRemovePaymentProfileUseCase(
  session: SessionModel,
): RemovePaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    RemovePaymentProfileUseCase.RequestModel,
    { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] }
  >();
  const useCase = new DbRemovePaymentProfileUseCase(repository, repository, validatorService);

  return useCase;
}
