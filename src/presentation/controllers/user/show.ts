import { ShowUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ShowUserController implements Controller<ShowUserUseCase.RequestModel> {
  constructor(private readonly showUserUseCase: ShowUserUseCase.UseCase) {}

  public async handle(params: ShowUserUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.showUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
