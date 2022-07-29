import { SessionModel } from '@/domain/models'
import { makeDbListUserUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { ListUserController } from '@/presentation/controllers'

export function makeListUserController(session: SessionModel): Controller {
  const controller = new ListUserController(makeDbListUserUseCase(session))

  return controller
}
