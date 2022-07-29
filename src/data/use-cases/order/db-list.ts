import { ListOrderRepository } from '@/data/contracts/repositories'
import { ListOrderValidation } from '@/data/contracts/validations'
import { ListOrderUseCase } from '@/domain/use-cases'

export class DbListOrderUseCase implements ListOrderUseCase.UseCase {
  constructor(
    private readonly listOrderRepository: ListOrderRepository.Repository,
    private readonly listOrderValidation: ListOrderValidation
  ) {}

  public async execute(
    requestModel: ListOrderUseCase.RequestModel
  ): Promise<ListOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    await this.listOrderValidation(sanitizedRequestModel)

    const orders = await this.listOrderRepository.list(sanitizedRequestModel)

    return orders
  }

  private sanitizeRequestModel(
    requestModel: ListOrderUseCase.RequestModel
  ): ListOrderUseCase.RequestModel {
    const sanitizedRequestModel: ListOrderUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    }

    return sanitizedRequestModel
  }
}
