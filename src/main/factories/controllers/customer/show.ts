import { makeDbShowCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ShowCustomerController } from '@/presentation/controllers';

export function makeShowCustomerController(): Controller {
  const controller = new ShowCustomerController(makeDbShowCustomerUseCase());

  return controller;
}
