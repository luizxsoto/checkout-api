import { makeDbCreateCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreateCustomerController } from '@/presentation/controllers';

export function makeCreateCustomerController(): Controller {
  const controller = new CreateCustomerController(makeDbCreateCustomerUseCase());

  return controller;
}
