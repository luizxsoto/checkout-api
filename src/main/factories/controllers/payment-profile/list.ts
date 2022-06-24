import { SessionModel } from '@/domain/models';
import { makeDbListPaymentProfileUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ListPaymentProfileController } from '@/presentation/controllers';

export function makeListPaymentProfileController(session: SessionModel): Controller {
  const controller = new ListPaymentProfileController(makeDbListPaymentProfileUseCase(session));

  return controller;
}
