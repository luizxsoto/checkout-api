import { CreateUserUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { CreateUserDto } from '@/presentation/dtos';
import { created } from '@/presentation/helpers';

export class CreateUserController implements Controller<CreateUserDto> {
  constructor(private readonly createUserUseCase: CreateUserUseCase.UseCase) {}

  public async handle(params: CreateUserDto): Promise<HttpResponse> {
    const useCaseResult = await this.createUserUseCase.execute(params);

    return created(useCaseResult);
  }
}
