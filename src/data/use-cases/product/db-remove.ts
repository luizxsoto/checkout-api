import { FindByProductRepository, RemoveProductRepository } from '@/data/contracts/repositories'
import { RemoveProductValidation } from '@/data/contracts/validations'
import { RemoveProductUseCase } from '@/domain/use-cases'

export class DbRemoveProductUseCase implements RemoveProductUseCase.UseCase {
  constructor(
    private readonly removeProductRepository: RemoveProductRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly removeProductValidation: RemoveProductValidation
  ) {}

  public async execute(
    requestModel: RemoveProductUseCase.RequestModel
  ): Promise<RemoveProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.removeProductValidation(sanitizedRequestModel)

    const products = await this.findByProductRepository.findBy([sanitizedRequestModel])

    await restValidation({ products })

    const [productRemoved] = await this.removeProductRepository.remove(sanitizedRequestModel)

    return { ...products[0], ...sanitizedRequestModel, ...productRemoved }
  }

  private sanitizeRequestModel(
    requestModel: RemoveProductUseCase.RequestModel
  ): RemoveProductUseCase.RequestModel {
    return {
      id: requestModel.id,
    }
  }
}
