import { SessionModel } from '@/domain/models';
import { makeDbCreateUserUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreateUserController } from '@/presentation/controllers';

export function makeCreateUserController(session: SessionModel): Controller {
  const controller = new CreateUserController(makeDbCreateUserUseCase(session));

  return controller;
}
