import { CreateProductRepository } from '@/data/contracts/repositories'
import { CreateProductValidation } from '@/data/contracts/validations'
import { CreateProductUseCase } from '@/domain/use-cases'

export class DbCreateProductUseCase implements CreateProductUseCase.UseCase {
  constructor(
    private readonly createProductRepository: CreateProductRepository.Repository,
    private readonly createProductValidation: CreateProductValidation
  ) {}

  public async execute(
    requestModel: CreateProductUseCase.RequestModel
  ): Promise<CreateProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    await this.createProductValidation(sanitizedRequestModel)

    const [productCreated] = await this.createProductRepository.create([sanitizedRequestModel])

    return { ...sanitizedRequestModel, ...productCreated }
  }

  private sanitizeRequestModel(
    requestModel: CreateProductUseCase.RequestModel
  ): CreateProductUseCase.RequestModel {
    return {
      name: requestModel.name,
      category: requestModel.category,
      image: requestModel.image,
      price: requestModel.price
    }
  }
}
