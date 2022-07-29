import { ShowOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ShowOrderDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class ShowOrderController implements Controller<ShowOrderDto> {
  constructor(private readonly showOrderUseCase: ShowOrderUseCase.UseCase) {}

  public async handle(params: ShowOrderDto): Promise<HttpResponse> {
    const useCaseResult = await this.showOrderUseCase.execute(params)

    return ok(useCaseResult)
  }
}
