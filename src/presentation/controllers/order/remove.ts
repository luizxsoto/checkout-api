import { RemoveOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class RemoveOrderController implements Controller<RemoveOrderUseCase.RequestModel> {
  constructor(private readonly removeOrderUseCase: RemoveOrderUseCase.UseCase) {}

  public async handle(params: RemoveOrderUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.removeOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
