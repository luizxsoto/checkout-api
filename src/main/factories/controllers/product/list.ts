import { SessionModel } from '@/domain/models'
import { makeDbListProductUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { ListProductController } from '@/presentation/controllers'

export function makeListProductController(session: SessionModel): Controller {
  const controller = new ListProductController(makeDbListProductUseCase(session))

  return controller
}
