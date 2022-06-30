import { SessionModel } from '@/domain/models';
import { makeDbRemoveProductUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveProductController } from '@/presentation/controllers';

export function makeRemoveProductController(session: SessionModel): Controller {
  const controller = new RemoveProductController(makeDbRemoveProductUseCase(session));

  return controller;
}
