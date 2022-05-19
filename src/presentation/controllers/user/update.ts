import { UpdateUserUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { UpdateUserDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class UpdateUserController implements Controller<UpdateUserDto> {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase.UseCase) {}

  public async handle(params: UpdateUserDto): Promise<HttpResponse> {
    const useCaseResult = await this.updateUserUseCase.execute(params);

    return ok(useCaseResult);
  }
}
