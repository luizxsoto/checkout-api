import { SessionModel } from '@/domain/models';
import { makeDbShowCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ShowCustomerController } from '@/presentation/controllers';

export function makeShowCustomerController(session: SessionModel): Controller {
  const controller = new ShowCustomerController(makeDbShowCustomerUseCase(session));

  return controller;
}
