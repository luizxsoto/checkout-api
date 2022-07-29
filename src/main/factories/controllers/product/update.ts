import { SessionModel } from '@/domain/models'
import { makeDbUpdateProductUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { UpdateProductController } from '@/presentation/controllers'

export function makeUpdateProductController(session: SessionModel): Controller {
  const controller = new UpdateProductController(makeDbUpdateProductUseCase(session))

  return controller
}
