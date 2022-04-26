import { CreateCustomerUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { CreateCustomerDto } from '@/presentation/dtos';
import { created } from '@/presentation/helpers';

export class CreateCustomerController implements Controller<CreateCustomerDto> {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase.UseCase) {}

  public async handle(params: CreateCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.createCustomerUseCase.execute(params);

    return created(useCaseResult);
  }
}
