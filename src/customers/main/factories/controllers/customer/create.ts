import { makeDbCreateCustomerUseCase } from '@/customers/main/factories/use-cases';
import { CreateCustomerController } from '@/customers/presentation/controllers';
import { Controller } from '@/shared/contracts/presentation';

export function makeCreateCustomerController(): Controller {
  const controller = new CreateCustomerController(makeDbCreateCustomerUseCase());

  return controller;
}
