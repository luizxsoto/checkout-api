import { SessionModel } from '@/domain/models';
import { makeDbShowPaymentProfileUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ShowPaymentProfileController } from '@/presentation/controllers';

export function makeShowPaymentProfileController(session: SessionModel): Controller {
  const controller = new ShowPaymentProfileController(makeDbShowPaymentProfileUseCase(session));

  return controller;
}
