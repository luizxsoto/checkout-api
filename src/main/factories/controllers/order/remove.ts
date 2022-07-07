import { SessionModel } from '@/domain/models';
import { makeDbRemoveOrderUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveOrderController } from '@/presentation/controllers';

export function makeRemoveOrderController(session: SessionModel): Controller {
  const controller = new RemoveOrderController(makeDbRemoveOrderUseCase(session));

  return controller;
}
