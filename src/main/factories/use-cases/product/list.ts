import { DbListProductUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { ListProductUseCase } from '@/domain/use-cases'
import { KnexProductRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeListProductValidation } from '@/main/factories/validations'

export function makeDbListProductUseCase(session: SessionModel): ListProductUseCase.UseCase {
  const repository = new KnexProductRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const listProductValidation = makeListProductValidation(validationService)
  const useCase = new DbListProductUseCase(repository, listProductValidation)

  return useCase
}
