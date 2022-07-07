import { SessionModel } from '@/domain/models';
import { makeDbListOrderUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ListOrderController } from '@/presentation/controllers';

export function makeListOrderController(session: SessionModel): Controller {
  const controller = new ListOrderController(makeDbListOrderUseCase(session));

  return controller;
}
