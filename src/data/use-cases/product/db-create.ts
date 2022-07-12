import { CreateProductRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { ProductModel } from '@/domain/models';
import { CreateProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';

export class DbCreateProductUseCase implements CreateProductUseCase.UseCase {
  constructor(
    private readonly createProductRepository: CreateProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      CreateProductUseCase.RequestModel,
      { products: ProductModel[] }
    >,
  ) {}

  public async execute(
    requestModel: CreateProductUseCase.RequestModel,
  ): Promise<CreateProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const productCreated = await this.createProductRepository.create(sanitizedRequestModel);

    return { ...sanitizedRequestModel, ...productCreated };
  }

  private sanitizeRequestModel(
    requestModel: CreateProductUseCase.RequestModel,
  ): CreateProductUseCase.RequestModel {
    return {
      name: requestModel.name,
      category: requestModel.category,
      image: requestModel.image,
      price: requestModel.price,
    };
  }

  private async validateRequestModel(
    requestModel: CreateProductUseCase.RequestModel,
  ): Promise<void> {
    await this.validatorService.validate({
      schema: {
        name: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.length({ minLength: 6, maxLength: 255 }),
        ],
        category: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
        ],
        image: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'url' }),
        ],
        price: [
          this.validatorService.rules.required(),
          this.validatorService.rules.integer(),
          this.validatorService.rules.max({ value: MAX_INTEGER }),
        ],
      },
      model: requestModel,
      data: { products: [] },
    });
  }
}
