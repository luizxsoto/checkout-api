import { RemoveProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { RemoveProductDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class RemoveProductController implements Controller<RemoveProductDto> {
  constructor(private readonly removeProductUseCase: RemoveProductUseCase.UseCase) {}

  public async handle(params: RemoveProductDto): Promise<HttpResponse> {
    const useCaseResult = await this.removeProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
