import { SessionModel } from '@/domain/models'
import { makeDbCreateSessionUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { CreateSessionController } from '@/presentation/controllers'

export function makeCreateSessionController(session?: SessionModel): Controller {
  const controller = new CreateSessionController(makeDbCreateSessionUseCase(session))

  return controller
}
