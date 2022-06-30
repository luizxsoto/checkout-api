import { ShowProductUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ShowProductDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ShowProductController implements Controller<ShowProductDto> {
  constructor(private readonly showProductUseCase: ShowProductUseCase.UseCase) {}

  public async handle(params: ShowProductDto): Promise<HttpResponse> {
    const useCaseResult = await this.showProductUseCase.execute(params);

    return ok(useCaseResult);
  }
}
