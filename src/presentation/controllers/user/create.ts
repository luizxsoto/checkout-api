import { CreateUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { created } from '@/presentation/helpers'

export class CreateUserController implements Controller<CreateUserUseCase.RequestModel> {
  constructor(private readonly createUserUseCase: CreateUserUseCase.UseCase) {}

  public async handle(params: CreateUserUseCase.RequestModel): Promise<HttpResponse> {
    const useCaseResult = await this.createUserUseCase.execute(params)

    return created(useCaseResult)
  }
}
