import { ShowPaymentProfileUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ShowPaymentProfileDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ShowPaymentProfileController implements Controller<ShowPaymentProfileDto> {
  constructor(private readonly showPaymentProfileUseCase: ShowPaymentProfileUseCase.UseCase) {}

  public async handle(params: ShowPaymentProfileDto): Promise<HttpResponse> {
    const useCaseResult = await this.showPaymentProfileUseCase.execute(params);

    return ok(useCaseResult);
  }
}
