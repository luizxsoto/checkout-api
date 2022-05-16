import { makeDbListCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ListCustomerController } from '@/presentation/controllers';

export function makeListCustomerController(): Controller {
  const controller = new ListCustomerController(makeDbListCustomerUseCase());

  return controller;
}
