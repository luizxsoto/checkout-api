import { CreateProductUseCase } from '@/domain/use-cases'
import { Controller, HttpResponse } from '@/presentation/contracts'
import { CreateProductDto } from '@/presentation/dtos'
import { created } from '@/presentation/helpers'

export class CreateProductController implements Controller<CreateProductDto> {
  constructor(private readonly createProductUseCase: CreateProductUseCase.UseCase) {}

  public async handle(params: CreateProductDto): Promise<HttpResponse> {
    const useCaseResult = await this.createProductUseCase.execute(params)

    return created(useCaseResult)
  }
}
