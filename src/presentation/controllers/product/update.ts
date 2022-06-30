import { UpdateProductUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { UpdateProductDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class UpdateProductController implements Controller<UpdateProductDto> {
  constructor(private readonly updateProductUseCase: UpdateProductUseCase.UseCase) {}

  public async handle(params: UpdateProductDto): Promise<HttpResponse> {
    const useCaseResult = await this.updateProductUseCase.execute(params);

    return ok(useCaseResult);
  }
}
