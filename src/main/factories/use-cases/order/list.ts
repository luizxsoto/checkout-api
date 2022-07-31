import { DbListOrderUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { ListOrderUseCase } from '@/domain/use-cases'
import { KnexOrderRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeListOrderValidation } from '@/main/factories/validations'

export function makeDbListOrderUseCase(session: SessionModel): ListOrderUseCase.UseCase {
  const repository = new KnexOrderRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const listOrderValidation = makeListOrderValidation(validationService)
  const useCase = new DbListOrderUseCase(repository, listOrderValidation, session)

  return useCase
}
