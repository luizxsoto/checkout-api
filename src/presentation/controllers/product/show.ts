import { ShowProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ShowProductController implements Controller<ShowProductUseCase.RequestModel> {
  constructor(private readonly showProductUseCase: ShowProductUseCase.UseCase) {}

  public async handle(params: ShowProductUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.showProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
