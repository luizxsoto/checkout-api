import { ShowUserUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ShowUserDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ShowUserController implements Controller<ShowUserDto> {
  constructor(private readonly showUserUseCase: ShowUserUseCase.UseCase) {}

  public async handle(params: ShowUserDto): Promise<HttpResponse> {
    const useCaseResult = await this.showUserUseCase.execute(params);

    return ok(useCaseResult);
  }
}
