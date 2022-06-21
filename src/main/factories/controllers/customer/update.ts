import { SessionModel } from '@/domain/models';
import { makeDbUpdateCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { UpdateCustomerController } from '@/presentation/controllers';

export function makeUpdateCustomerController(session: SessionModel): Controller {
  const controller = new UpdateCustomerController(makeDbUpdateCustomerUseCase(session));

  return controller;
}
