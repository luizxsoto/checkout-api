import { CreateOrderUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { created } from '@/presentation/helpers'

export class CreateOrderController implements Controller<CreateOrderUseCase.RequestModel> {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase.UseCase) {}

  public async handle(params: CreateOrderUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.createOrderUseCase.execute(params)

    return created(useCaseResult)
  }
}
