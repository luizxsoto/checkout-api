import { DbRemoveUserUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { RemoveUserUseCase } from '@/domain/use-cases'
import { KnexUserRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeRemoveUserValidation } from '@/main/factories/validations'

export function makeDbRemoveUserUseCase(session: SessionModel): RemoveUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const removeUserValidation = makeRemoveUserValidation(validationService)
  const useCase = new DbRemoveUserUseCase(repository, repository, removeUserValidation)

  return useCase
}
