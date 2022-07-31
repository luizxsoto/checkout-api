import { DbCreateOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { CreateOrderUseCase } from '@/domain/use-cases'
import {
  KnexOrderItemRepository,
  KnexOrderRepository,
  KnexProductRepository
} from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeCreateOrderValidation } from '@/main/factories/validations'

export function makeDbCreateOrderUseCase(session: SessionModel): CreateOrderUseCase.UseCase {
  const uuidService = new UUIDService()
  const repository = new KnexOrderRepository(session, knexConfig, uuidService)
  const orderItemRepository = new KnexOrderItemRepository(session, knexConfig, uuidService)
  const productRepository = new KnexProductRepository(session, knexConfig, uuidService)
  const validationService = new CompositeValidation()
  const createOrderValidation = makeCreateOrderValidation(validationService)
  const useCase = new DbCreateOrderUseCase(
    repository,
    orderItemRepository,
    productRepository,
    createOrderValidation,
    session
  )

  return useCase
}
