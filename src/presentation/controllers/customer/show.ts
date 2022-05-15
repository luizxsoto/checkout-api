import { ShowCustomerUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ShowCustomerDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ShowCustomerController implements Controller<ShowCustomerDto> {
  constructor(private readonly showCustomerUseCase: ShowCustomerUseCase.UseCase) {}

  public async handle(params: ShowCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.showCustomerUseCase.execute(params);

    return ok(useCaseResult);
  }
}
