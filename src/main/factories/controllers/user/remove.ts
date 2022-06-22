import { SessionModel } from '@/domain/models';
import { makeDbRemoveUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveUserController } from '@/presentation/controllers';

export function makeRemoveUserController(session: SessionModel): Controller {
  const controller = new RemoveUserController(makeDbRemoveUserUseCase(session));

  return controller;
}
