import { makeDbRemoveCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveCustomerController } from '@/presentation/controllers';

export function makeRemoveCustomerController(): Controller {
  const controller = new RemoveCustomerController(makeDbRemoveCustomerUseCase());

  return controller;
}
