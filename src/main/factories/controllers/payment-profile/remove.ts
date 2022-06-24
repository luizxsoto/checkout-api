import { SessionModel } from '@/domain/models';
import { makeDbRemovePaymentProfileUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemovePaymentProfileController } from '@/presentation/controllers';

export function makeRemovePaymentProfileController(session: SessionModel): Controller {
  const controller = new RemovePaymentProfileController(makeDbRemovePaymentProfileUseCase(session));

  return controller;
}
