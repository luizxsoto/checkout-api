import { ShowOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ShowOrderController implements Controller<ShowOrderUseCase.RequestModel> {
  constructor(private readonly showOrderUseCase: ShowOrderUseCase.UseCase) {}

  public async handle(params: ShowOrderUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.showOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
