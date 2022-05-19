import { makeDbCreateSessionUseCase } from '@/main/factories/use-cases';
import { Controller } from '@/presentation/contracts';
import { CreateSessionController } from '@/presentation/controllers';

export function makeCreateSessionController(): Controller {
  const controller = new CreateSessionController(makeDbCreateSessionUseCase());

  return controller;
}
