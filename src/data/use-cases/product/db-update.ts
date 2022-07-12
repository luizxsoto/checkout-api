import { FindByProductRepository, UpdateProductRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { ProductModel } from '@/domain/models';
import { UpdateProductUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';

export class DbUpdateProductUseCase implements UpdateProductUseCase.UseCase {
  constructor(
    private readonly updateProductRepository: UpdateProductRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdateProductUseCase.RequestModel,
      { products: ProductModel[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdateProductUseCase.RequestModel,
  ): Promise<UpdateProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const products = await this.findByProductRepository.findBy([{ id: sanitizedRequestModel.id }]);

    await restValidation({ products });

    const [productUpdated] = await this.updateProductRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );

    const findedProductById = products.find((product) => product.id === sanitizedRequestModel.id);

    return { ...findedProductById, ...sanitizedRequestModel, ...productUpdated };
  }

  private sanitizeRequestModel(
    requestModel: UpdateProductUseCase.RequestModel,
  ): UpdateProductUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      category: requestModel.category,
      image: requestModel.image,
      price: requestModel.price,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateProductUseCase.RequestModel,
  ): Promise<(validationData: { products: ProductModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          this.validatorService.rules.string(),
          this.validatorService.rules.length({ minLength: 6, maxLength: 255 }),
        ],
        category: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['clothes', 'shoes', 'others'] }),
        ],
        image: [
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'url' }),
        ],
        price: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.max({ value: MAX_INTEGER }),
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
          name: [],
          category: [],
          image: [],
          price: [],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
