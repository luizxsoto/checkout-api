import { UpdatePaymentProfileUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { UpdatePaymentProfileDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class UpdatePaymentProfileController implements Controller<UpdatePaymentProfileDto> {
  constructor(private readonly updatePaymentProfileUseCase: UpdatePaymentProfileUseCase.UseCase) {}

  public async handle(params: UpdatePaymentProfileDto): Promise<HttpResponse> {
    const useCaseResult = await this.updatePaymentProfileUseCase.execute(params);

    return ok(useCaseResult);
  }
}
