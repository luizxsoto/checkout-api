import { FindByProductRepository, UpdateProductRepository } from '@/data/contracts/repositories'
import { UpdateProductValidation } from '@/data/contracts/validations'
import { UpdateProductUseCase } from '@/domain/use-cases'

export class DbUpdateProductUseCase implements UpdateProductUseCase.UseCase {
  constructor(
    private readonly updateProductRepository: UpdateProductRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly updateProductValidation: UpdateProductValidation
  ) {}

  public async execute(
    requestModel: UpdateProductUseCase.RequestModel
  ): Promise<UpdateProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.updateProductValidation(sanitizedRequestModel)

    const products = await this.findByProductRepository.findBy([{ id: sanitizedRequestModel.id }])

    await restValidation({ products })

    const [productUpdated] = await this.updateProductRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel
    )

    const findedProductById = products.find((product) => product.id === sanitizedRequestModel.id)

    return { ...findedProductById, ...sanitizedRequestModel, ...productUpdated }
  }

  private sanitizeRequestModel(
    requestModel: UpdateProductUseCase.RequestModel
  ): UpdateProductUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      category: requestModel.category,
      image: requestModel.image,
      price: requestModel.price,
    }
  }
}
