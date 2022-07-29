import { ListUserUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { ListUserDto } from '@/presentation/dtos'
import { ok } from '@/presentation/helpers'

export class ListUserController implements Controller<ListUserDto> {
  constructor(private readonly listUserUseCase: ListUserUseCase.UseCase) {}

  public async handle(params: ListUserDto): Promise<HttpResponse> {
    const useCaseResult = await this.listUserUseCase.execute(params)

    return ok(useCaseResult)
  }
}
