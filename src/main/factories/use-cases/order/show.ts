import { DbShowOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { ShowOrderUseCase } from '@/domain/use-cases'
import { KnexOrderItemRepository, KnexOrderRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeShowOrderValidation } from '@/main/factories/validations'

export function makeDbShowOrderUseCase(session: SessionModel): ShowOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService())
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const showOrderValidation = makeShowOrderValidation(validationService)
  const useCase = new DbShowOrderUseCase(
    repository,
    orderItemRepository,
    showOrderValidation,
    session
  )

  return useCase
}
