import { DbCreateSessionUseCase } from '@/data/use-cases'
import { SessionModel } from '@/domain/models'
import { CreateSessionUseCase } from '@/domain/use-cases'
import { BcryptCryptography, JwtCryptography } from '@/infra/cryptography'
import { KnexUserRepository } from '@/infra/repositories'
import { UUIDService } from '@/infra/services'
import { CompositeValidation } from '@/main/composites'
import { envConfig, knexConfig } from '@/main/config'
import { makeCreateSessionValidation } from '@/main/factories/validations'

export function makeDbCreateSessionUseCase(): CreateSessionUseCase.UseCase {
  const repository = new KnexUserRepository<'NORMAL'>(
    {} as SessionModel,
    knexConfig,
    new UUIDService()
  )
  const validationService = new CompositeValidation()
  const salt = 12
  const bcryptCryptography = new BcryptCryptography(salt)
  const createSessionValidation = makeCreateSessionValidation(validationService, bcryptCryptography)
  const jwtCryptography = new JwtCryptography(envConfig.jwtSecret)
  const useCase = new DbCreateSessionUseCase(repository, jwtCryptography, createSessionValidation)

  return useCase
}
