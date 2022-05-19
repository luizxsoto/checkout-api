import { makeDbRemoveUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { RemoveUserController } from '@/presentation/controllers';

export function makeRemoveUserController(): Controller {
  const controller = new RemoveUserController(makeDbRemoveUserUseCase());

  return controller;
}
