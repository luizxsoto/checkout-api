import { DbRemoveOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { RemoveOrderUseCase } from '@/domain/use-cases'
import { KnexOrderItemRepository, KnexOrderRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeRemoveOrderValidation } from '@/main/factories/validations'

export function makeDbRemoveOrderUseCase(session: SessionModel): RemoveOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService())
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const removeOrderValidation = makeRemoveOrderValidation(validationService)
  const useCase = new DbRemoveOrderUseCase(
    repository,
    orderItemRepository,
    repository,
    removeOrderValidation
  )

  return useCase
}
