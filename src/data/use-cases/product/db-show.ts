import { FindByProductRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { ProductModel } from '@/domain/models';
import { ShowProductUseCase } from '@/domain/use-cases';

export class DbShowProductUseCase implements ShowProductUseCase.UseCase {
  constructor(
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ShowProductUseCase.RequestModel,
      { products: ProductModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowProductUseCase.RequestModel,
  ): Promise<ShowProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const products = await this.findByProductRepository.findBy([sanitizedRequestModel]);

    await restValidation({ products });

    return { ...products[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowProductUseCase.RequestModel,
  ): ShowProductUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: ShowProductUseCase.RequestModel,
  ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { products: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'products',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
