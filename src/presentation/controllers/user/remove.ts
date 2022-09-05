import { RemoveUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class RemoveUserController implements Controller<RemoveUserUseCase.RequestModel> {
  constructor(private readonly removeUserUseCase: RemoveUserUseCase.UseCase) {}

  public async handle(params: RemoveUserUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.removeUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
