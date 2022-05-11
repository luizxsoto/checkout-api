import { makeDbUpdateCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { UpdateCustomerController } from '@/presentation/controllers';

export function makeUpdateCustomerController(): Controller {
  const controller = new UpdateCustomerController(makeDbUpdateCustomerUseCase());

  return controller;
}
