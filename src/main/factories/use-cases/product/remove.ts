import { DbRemoveProductUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { RemoveProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { CompositeValidation } from '@/main/composites';
import { knexConfig } from '@/main/config';
import { makeRemoveProductValidation } from '@/main/factories/validations';

export function makeDbRemoveProductUseCase(session: SessionModel): RemoveProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validationService = new CompositeValidation();
  const removeProductValidation = makeRemoveProductValidation(validationService);
  const useCase = new DbRemoveProductUseCase(repository, repository, removeProductValidation);

  return useCase;
}
