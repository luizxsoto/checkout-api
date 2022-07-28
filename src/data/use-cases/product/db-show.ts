import { FindByProductRepository } from '@/data/contracts/repositories';
import { ShowProductValidation } from '@/data/contracts/validations';
import { ShowProductUseCase } from '@/domain/use-cases';

export class DbShowProductUseCase implements ShowProductUseCase.UseCase {
  constructor(
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly showProductValidation: ShowProductValidation,
  ) {}

  public async execute(
    requestModel: ShowProductUseCase.RequestModel,
  ): Promise<ShowProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.showProductValidation(sanitizedRequestModel);

    const products = await this.findByProductRepository.findBy([sanitizedRequestModel]);

    await restValidation({ products });

    return { ...products[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowProductUseCase.RequestModel,
  ): ShowProductUseCase.RequestModel {
    return { id: requestModel.id };
  }
}
