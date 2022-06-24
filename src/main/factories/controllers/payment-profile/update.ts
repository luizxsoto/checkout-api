import { SessionModel } from '@/domain/models';
import { makeDbUpdatePaymentProfileUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { UpdatePaymentProfileController } from '@/presentation/controllers';

export function makeUpdatePaymentProfileController(session: SessionModel): Controller {
  const controller = new UpdatePaymentProfileController(makeDbUpdatePaymentProfileUseCase(session));

  return controller;
}
