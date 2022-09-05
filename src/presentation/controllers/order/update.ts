import { UpdateOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class UpdateOrderController implements Controller<UpdateOrderUseCase.RequestModel> {
  constructor(private readonly updateOrderUseCase: UpdateOrderUseCase.UseCase) {}

  public async handle(params: UpdateOrderUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.updateOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
