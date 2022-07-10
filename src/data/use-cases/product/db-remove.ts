import { FindByProductRepository, RemoveProductRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { ProductModel } from '@/domain/models';
import { RemoveProductUseCase } from '@/domain/use-cases';

export class DbRemoveProductUseCase implements RemoveProductUseCase.UseCase {
  constructor(
    private readonly removeProductRepository: RemoveProductRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      RemoveProductUseCase.RequestModel,
      { products: ProductModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveProductUseCase.RequestModel,
  ): Promise<RemoveProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const products = await this.findByProductRepository.findBy([sanitizedRequestModel]);

    await restValidation({ products });

    const [productRemoved] = await this.removeProductRepository.remove(sanitizedRequestModel);

    return { ...products[0], ...sanitizedRequestModel, ...productRemoved };
  }

  private sanitizeRequestModel(
    requestModel: RemoveProductUseCase.RequestModel,
  ): RemoveProductUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }

  private async validateRequestModel(
    requestModel: RemoveProductUseCase.RequestModel,
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
