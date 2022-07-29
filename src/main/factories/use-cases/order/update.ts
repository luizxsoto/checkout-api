import { DbUpdateOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { UpdateOrderUseCase } from '@/domain/use-cases'
import { KnexOrderRepository, KnexUserRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeUpdateOrderValidation } from '@/main/factories/validations'

export function makeDbUpdateOrderUseCase(session: SessionModel): UpdateOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService())
  const userRepository = new KnexUserRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const updateOrderValidation = makeUpdateOrderValidation(validationService)
  const useCase = new DbUpdateOrderUseCase(
    repository,
    repository,
    userRepository,
    updateOrderValidation
  )

  return useCase
}
