import { RemoveCustomerUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { RemoveCustomerDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class RemoveCustomerController implements Controller<RemoveCustomerDto> {
  constructor(private readonly removeCustomerUseCase: RemoveCustomerUseCase.UseCase) {}

  public async handle(params: RemoveCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.removeCustomerUseCase.execute(params);

    return ok(useCaseResult);
  }
}
