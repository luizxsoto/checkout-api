import { CreateSessionUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { CreateSessionDto } from '@/presentation/dtos';
import { created } from '@/presentation/helpers';

export class CreateSessionController implements Controller<CreateSessionDto> {
  constructor(private readonly createSessionUseCase: CreateSessionUseCase.UseCase) {}

  public async handle(params: CreateSessionDto): Promise<HttpResponse> {
    const useCaseResult = await this.createSessionUseCase.execute(params);

    return created(useCaseResult);
  }
}
