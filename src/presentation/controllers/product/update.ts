import { UpdateProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class UpdateProductController implements Controller<UpdateProductUseCase.RequestModel> {
  constructor(private readonly updateProductUseCase: UpdateProductUseCase.UseCase) {}

  public async handle(params: UpdateProductUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.updateProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
