import { UpdateOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { UpdateOrderDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class UpdateOrderController implements Controller<UpdateOrderDto> {
  constructor(private readonly updateOrderUseCase: UpdateOrderUseCase.UseCase) {}

  public async handle(params: UpdateOrderDto): Promise<HttpResponse> {
    const useCaseResult = await this.updateOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
