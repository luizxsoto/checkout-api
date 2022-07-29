import { SessionModel } from '@/domain/models'
import { makeDbUpdateUserUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { UpdateUserController } from '@/presentation/controllers'

export function makeUpdateUserController(session: SessionModel): Controller {
  const controller = new UpdateUserController(makeDbUpdateUserUseCase(session))

  return controller
}
