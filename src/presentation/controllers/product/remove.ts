import { RemoveProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class RemoveProductController implements Controller<RemoveProductUseCase.RequestModel> {
  constructor(private readonly removeProductUseCase: RemoveProductUseCase.UseCase) {}

  public async handle(params: RemoveProductUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.removeProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
