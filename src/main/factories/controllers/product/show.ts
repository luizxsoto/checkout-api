import { SessionModel } from '@/domain/models'
import { makeDbShowProductUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { ShowProductController } from '@/presentation/controllers'

export function makeShowProductController(session: SessionModel): Controller {
  const controller = new ShowProductController(makeDbShowProductUseCase(session))

  return controller
}
