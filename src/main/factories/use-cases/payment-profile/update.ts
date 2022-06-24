import { DbUpdatePaymentProfileUseCase } from '@/data/use-cases';
import { PaymentProfileModel, SessionModel } from '@/domain/models';
import { UpdatePaymentProfileUseCase } from '@/domain/use-cases';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdatePaymentProfileUseCase(
  session: SessionModel,
): UpdatePaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Omit<UpdatePaymentProfileUseCase.RequestModel, 'data'> & {
      data?: string | PaymentProfileModel['data'];
    },
    { paymentProfiles: (Omit<PaymentProfileModel, 'data'> & { data: string })[] }
  >();
  const useCase = new DbUpdatePaymentProfileUseCase(repository, repository, validatorService);

  return useCase;
}
