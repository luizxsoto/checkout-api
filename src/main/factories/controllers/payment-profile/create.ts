import { SessionModel } from '@/domain/models';
import { makeDbCreatePaymentProfileUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreatePaymentProfileController } from '@/presentation/controllers';

export function makeCreatePaymentProfileController(session: SessionModel): Controller {
  const controller = new CreatePaymentProfileController(makeDbCreatePaymentProfileUseCase(session));

  return controller;
}
