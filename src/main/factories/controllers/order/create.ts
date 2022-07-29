import { SessionModel } from '@/domain/models'
import { makeDbCreateOrderUseCase } from '@/main/factories/use-cases'
import { Controller } from '@/presentation/contracts'
import { CreateOrderController } from '@/presentation/controllers'

export function makeCreateOrderController(session: SessionModel): Controller {
  const controller = new CreateOrderController(makeDbCreateOrderUseCase(session))

  return controller
}
