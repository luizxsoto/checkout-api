import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { CreatePaymentProfileDto } from '@/presentation/dtos';
import { created } from '@/presentation/helpers';

export class CreatePaymentProfileController implements Controller<CreatePaymentProfileDto> {
  constructor(private readonly createPaymentProfileUseCase: CreatePaymentProfileUseCase.UseCase) {}

  public async handle(params: CreatePaymentProfileDto): Promise<HttpResponse> {
    const useCaseResult = await this.createPaymentProfileUseCase.execute(params);

    return created(useCaseResult);
  }
}
