import { SessionModel } from '@/domain/models';
import { makeDbCreateCustomerUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreateCustomerController } from '@/presentation/controllers';

export function makeCreateCustomerController(session: SessionModel): Controller {
  const controller = new CreateCustomerController(makeDbCreateCustomerUseCase(session));

  return controller;
}
