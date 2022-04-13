import { CreateCustomerUseCase } from '@/customers/domain/use-cases';
import { CreateCustomerDto } from '@/customers/presentation/dtos';
import { Controller, HttpResponse } from '@/shared/contracts/presentation';
import { created } from '@/shared/helpers';

export class CreateCustomerController implements Controller<CreateCustomerDto> {
  constructor(private readonly createCustomerUseCase: CreateCustomerUseCase.UseCase) {}

  public async handle(params: CreateCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.createCustomerUseCase.execute(params);

    return created(useCaseResult);
  }
}
