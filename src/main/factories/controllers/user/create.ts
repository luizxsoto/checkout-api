import { makeDbCreateUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreateUserController } from '@/presentation/controllers';

export function makeCreateUserController(): Controller {
  const controller = new CreateUserController(makeDbCreateUserUseCase());

  return controller;
}
