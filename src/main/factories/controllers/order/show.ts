import { SessionModel } from '@/domain/models';
import { makeDbShowOrderUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ShowOrderController } from '@/presentation/controllers';

export function makeShowOrderController(session: SessionModel): Controller {
  const controller = new ShowOrderController(makeDbShowOrderUseCase(session));

  return controller;
}
