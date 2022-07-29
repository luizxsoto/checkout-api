import { ListProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ListProductDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class ListProductController implements Controller<ListProductDto> {
  constructor(private readonly listProductUseCase: ListProductUseCase.UseCase) {}

  public async handle(params: ListProductDto): Promise<HttpResponse> {
    const useCaseResult = await this.listProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
