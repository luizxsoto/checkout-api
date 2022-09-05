import { UpdateUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ok } from '@/presentation/helpers'

export class UpdateUserController implements Controller<UpdateUserUseCase.RequestModel> {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase.UseCase) {}

  public async handle(params: UpdateUserUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.updateUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
