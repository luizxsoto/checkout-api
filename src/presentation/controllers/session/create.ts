import { CreateSessionUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { created } from '@/presentation/helpers'

export class CreateSessionController implements Controller<CreateSessionUseCase.RequestModel> {
  constructor(private readonly createSessionUseCase: CreateSessionUseCase.UseCase) {}

  public async handle(params: CreateSessionUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.createSessionUseCase.execute(params)

    return created(useCaseResult)
  }
}
