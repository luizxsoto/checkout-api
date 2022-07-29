import { SessionModel } from '@/domain/models'
import { makeDbCreateProductUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { CreateProductController } from '@/presentation/controllers'

export function makeCreateProductController(session: SessionModel): Controller {
  const controller = new CreateProductController(makeDbCreateProductUseCase(session))

  return controller
}
