import { RemoveUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { RemoveUserDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class RemoveUserController implements Controller<RemoveUserDto> {
  constructor(private readonly removeUserUseCase: RemoveUserUseCase.UseCase) {}

  public async handle(params: RemoveUserDto): Promise<HttpResponse> {
    const useCaseResult = await this.removeUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
