import { DbListUserUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ListUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { CompositeValidation } from '@/main/composites';
import { knexConfig } from '@/main/config';

export function makeDbListUserUseCase(session: SessionModel): ListUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validationService = new CompositeValidation();
  const useCase = new DbListUserUseCase(repository, validationService);

  return useCase;
}
