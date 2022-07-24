import { DbShowUserUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { CompositeValidation } from '@/main/composites';
import { knexConfig } from '@/main/config';

export function makeDbShowUserUseCase(session: SessionModel): ShowUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService());
  const validationService = new CompositeValidation();
  const useCase = new DbShowUserUseCase(repository, validationService);

  return useCase;
}
