import { RemoveOrderUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { RemoveOrderDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class RemoveOrderController implements Controller<RemoveOrderDto> {
  constructor(private readonly removeOrderUseCase: RemoveOrderUseCase.UseCase) {}

  public async handle(params: RemoveOrderDto): Promise<HttpResponse> {
    const useCaseResult = await this.removeOrderUseCase.execute(params);

    return ok(useCaseResult);
  }
}
