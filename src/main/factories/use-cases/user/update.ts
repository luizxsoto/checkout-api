import { DbUpdateUserUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { UpdateUserUseCase } from '@/domain/use-cases'
import { BcryptCryptography } from '@/infra/cryptography'
import { KnexUserRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { knexConfig } from '@/main/config'
import { makeUpdateUserValidation } from '@/main/factories/validations'

export function makeDbUpdateUserUseCase(session: SessionModel): UpdateUserUseCase.UseCase {
  const repository = new KnexUserRepository(session, knexConfig, new UUIDService())
  const validationService = new CompositeValidation()
  const updateUserValidation = makeUpdateUserValidation(validationService, session)
  const salt = 12
  const bcryptCryptography = new BcryptCryptography(salt)
  const useCase = new DbUpdateUserUseCase(
    repository,
    repository,
    updateUserValidation,
    bcryptCryptography
  )

  return useCase
}
