import { DbCreateProductUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { CreateProductUseCase } from '@/domain/use-cases'
import { KnexProductRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeCreateProductValidation } from '@/main/factories/validations'

export function makeDbCreateProductUseCase(session: SessionModel): CreateProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const createProductValidation = makeCreateProductValidation(validationService)
  const useCase = new DbCreateProductUseCase(repository, createProductValidation)

  return useCase
}
