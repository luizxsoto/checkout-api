import { ListUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class ListUserController implements Controller<ListUserUseCase.RequestModel> {
  constructor(private readonly listUserUseCase: ListUserUseCase.UseCase) {}

  public async handle(params: ListUserUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.listUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
