import { DbListPaymentProfileUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ListPaymentProfileUseCase } from '@/domain/use-cases';
import { KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbListPaymentProfileUseCase(
  session: SessionModel,
): ListPaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    ListPaymentProfileUseCase.RequestModel,
    Record<string, unknown[]>
  >();
  const useCase = new DbListPaymentProfileUseCase(repository, validatorService);

  return useCase;
}
