import { ListProductRepository } from '@/data/contracts/repositories'
import { ListProductValidation } from '@/data/contracts/validations'
import { ListProductUseCase } from '@/domain/use-cases'

export class DbListProductUseCase implements ListProductUseCase.UseCase {
  constructor(
    private readonly listProductRepository: ListProductRepository.Repository,
    private readonly listProductValidation: ListProductValidation
  ) {}

  public async execute(
    requestModel: ListProductUseCase.RequestModel
  ): Promise<ListProductUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    await this.listProductValidation(sanitizedRequestModel)

    const products = await this.listProductRepository.list(sanitizedRequestModel)

    return products
  }

  private sanitizeRequestModel(
    requestModel: ListProductUseCase.RequestModel
  ): ListProductUseCase.RequestModel {
    const sanitizedRequestModel: ListProductUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    }

    return sanitizedRequestModel
  }
}
