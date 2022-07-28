import { DbShowProductUseCase } from '@/data/use-cases';
import { SessionModel } from '@/domain/models';
import { ShowProductUseCase } from '@/domain/use-cases';
import { KnexProductRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { CompositeValidation } from '@/main/composites';
import { knexConfig } from '@/main/config';
import { makeShowProductValidation } from '@/main/factories/validations';

export function makeDbShowProductUseCase(session: SessionModel): ShowProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService());
  const validationService = new CompositeValidation();
  const showProductValidation = makeShowProductValidation(validationService);
  const useCase = new DbShowProductUseCase(repository, showProductValidation);

  return useCase;
}
