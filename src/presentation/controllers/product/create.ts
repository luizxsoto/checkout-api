import { CreateProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { created } from '@/presentation/helpers'

export class CreateProductController implements Controller<CreateProductUseCase.RequestModel> {
  constructor(private readonly createProductUseCase: CreateProductUseCase.UseCase) {}

  public async handle(params: CreateProductUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.createProductUseCase.execute(params)

    return created(useCaseResult)
  }
}
