import { SessionModel } from '@/domain/models'
import { makeDbShowUserUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { ShowUserController } from '@/presentation/controllers'

export function makeShowUserController(session: SessionModel): Controller {
  const controller = new ShowUserController(makeDbShowUserUseCase(session))

  return controller
}
