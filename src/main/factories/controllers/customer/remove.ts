import { SessionModel } from '@/domain/models';
import { makeDbRemoveCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveCustomerController } from '@/presentation/controllers';

export function makeRemoveCustomerController(session: SessionModel): Controller {
  const controller = new RemoveCustomerController(makeDbRemoveCustomerUseCase(session));

  return controller;
}
