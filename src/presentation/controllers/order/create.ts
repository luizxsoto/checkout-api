import { CreateOrderUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { CreateOrderDto } from '@/presentation/dtos';
import { created } from '@/presentation/helpers';

export class CreateOrderController implements Controller<CreateOrderDto> {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase.UseCase) {}

  public async handle(params: CreateOrderDto): Promise<HttpResponse> {
    const useCaseResult = await this.createOrderUseCase.execute(params);

    return created(useCaseResult);
  }
}
