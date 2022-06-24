import { ListPaymentProfileUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ListPaymentProfileDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ListPaymentProfileController implements Controller<ListPaymentProfileDto> {
  constructor(private readonly listPaymentProfileUseCase: ListPaymentProfileUseCase.UseCase) {}

  public async handle(params: ListPaymentProfileDto): Promise<HttpResponse> {
    const useCaseResult = await this.listPaymentProfileUseCase.execute(params);

    return ok(useCaseResult);
  }
}
