import { DbUpdateProductUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { UpdateProductUseCase } from '@/domain/use-cases'
import { KnexProductRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeUpdateProductValidation } from '@/main/factories/validations'

export function makeDbUpdateProductUseCase(session: SessionModel): UpdateProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const updateProductValidation = makeUpdateProductValidation(validationService)
  const useCase = new DbUpdateProductUseCase(repository, repository, updateProductValidation)

  return useCase
}
