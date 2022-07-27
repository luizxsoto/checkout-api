import { DbShowPaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel, SessionModel } from '@/domain/models';
import { ShowPaymentProfileUseCase } from '@/domain/use-cases';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbShowPaymentProfileUseCase(
  session: SessionModel,
): ShowPaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ShowPaymentProfileUseCase.RequestModel,
    { paymentProfiles: Omit<PaymentProfileModel, 'number' | 'cvv'>[] }
  >();
  const useCase = new DbShowPaymentProfileUseCase(repository, validatorService);

  return useCase;
}
