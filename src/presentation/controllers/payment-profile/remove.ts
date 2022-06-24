import { RemovePaymentProfileUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { RemovePaymentProfileDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class RemovePaymentProfileController implements Controller<RemovePaymentProfileDto> {
  constructor(private readonly removePaymentProfileUseCase: RemovePaymentProfileUseCase.UseCase) {}

  public async handle(params: RemovePaymentProfileDto): Promise<HttpResponse> {
    const useCaseResult = await this.removePaymentProfileUseCase.execute(params);

    return ok(useCaseResult);
  }
}
