import { UpdateCustomerUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { UpdateCustomerDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class UpdateCustomerController implements Controller<UpdateCustomerDto> {
  constructor(private readonly updateCustomerUseCase: UpdateCustomerUseCase.UseCase) {}

  public async handle(params: UpdateCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.updateCustomerUseCase.execute(params);

    return ok(useCaseResult);
  }
}
