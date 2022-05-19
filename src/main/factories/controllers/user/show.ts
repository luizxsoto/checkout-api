import { makeDbShowUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { ShowUserController } from '@/presentation/controllers';

export function makeShowUserController(): Controller {
  const controller = new ShowUserController(makeDbShowUserUseCase());

  return controller;
}
