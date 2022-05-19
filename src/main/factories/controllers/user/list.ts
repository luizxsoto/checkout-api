import { makeDbListUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ListUserController } from '@/presentation/controllers';

export function makeListUserController(): Controller {
  const controller = new ListUserController(makeDbListUserUseCase());

  return controller;
}
