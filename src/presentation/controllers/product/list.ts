import { ListProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ListProductController implements Controller<ListProductUseCase.RequestModel> {
  constructor(private readonly listProductUseCase: ListProductUseCase.UseCase) {}

  public async handle(params: ListProductUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.listProductUseCase.execute(params)

    return ok(useCaseResult)
  }
}
