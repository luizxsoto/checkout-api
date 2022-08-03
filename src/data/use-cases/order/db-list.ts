import { ListOrderRepository } from '@/data/contracts/repositories'
import { ListOrderValidation } from '@/data/contracts/validations'
import { SessionModel } from '@/domain/models'
import { ListOrderUseCase } from '@/domain/use-cases'

export class DbListOrderUseCase implements ListOrderUseCase.UseCase {
  constructor(
    private readonly listOrderRepository: ListOrderRepository.Repository,
    private readonly listOrderValidation: ListOrderValidation,
    private readonly session: SessionModel
  ) {}

  public async execute(
    requestModel: ListOrderUseCase.RequestModel
  ): Promise<ListOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    await this.listOrderValidation(sanitizedRequestModel)

    let parsedFilter = JSON.parse(requestModel.filters ?? '[]')
    const rolesCanSeeAllOrders = ['admin', 'moderator']
    if (!rolesCanSeeAllOrders.includes(this.session.role)) {
      parsedFilter = ['&', ['=', 'userId', this.session.userId], parsedFilter]
    }
    const orders = await this.listOrderRepository.list({
      ...sanitizedRequestModel,
      filters: JSON.stringify(parsedFilter)
    })

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
      filters: requestModel.filters
    }

    return sanitizedRequestModel
  }
}
