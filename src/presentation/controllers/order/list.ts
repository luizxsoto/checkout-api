import { ListOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ListOrderDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class ListOrderController implements Controller<ListOrderDto> {
  constructor(private readonly listOrderUseCase: ListOrderUseCase.UseCase) {}

  public async handle(params: ListOrderDto): Promise<HttpResponse> {
    const useCaseResult = await this.listOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
