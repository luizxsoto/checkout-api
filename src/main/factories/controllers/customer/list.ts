import { SessionModel } from '@/domain/models';
import { makeDbListCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ListCustomerController } from '@/presentation/controllers';

export function makeListCustomerController(session: SessionModel): Controller {
  const controller = new ListCustomerController(makeDbListCustomerUseCase(session));

  return controller;
}
