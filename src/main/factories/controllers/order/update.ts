import { SessionModel } from '@/domain/models';
import { makeDbUpdateOrderUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { UpdateOrderController } from '@/presentation/controllers';

export function makeUpdateOrderController(session: SessionModel): Controller {
  const controller = new UpdateOrderController(makeDbUpdateOrderUseCase(session));

  return controller;
}
