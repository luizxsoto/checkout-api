import { ListOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ListOrderController implements Controller<ListOrderUseCase.RequestModel> {
  constructor(private readonly listOrderUseCase: ListOrderUseCase.UseCase) {}

  public async handle(params: ListOrderUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.listOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
