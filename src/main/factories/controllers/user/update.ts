import { makeDbUpdateUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { UpdateUserController } from '@/presentation/controllers';

export function makeUpdateUserController(): Controller {
  const controller = new UpdateUserController(makeDbUpdateUserUseCase());

  return controller;
}
