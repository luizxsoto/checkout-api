import { FindByOrderItemRepository, FindByOrderRepository } from '@/data/contracts/repositories'
import { ShowOrderValidation } from '@/data/contracts/validations'
import { OrderModel, SessionModel } from '@/domain/models'
import { ShowOrderUseCase } from '@/domain/use-cases'

export class DbShowOrderUseCase implements ShowOrderUseCase.UseCase {
  constructor(
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly findByOrderItemRepository: FindByOrderItemRepository.Repository,
    private readonly showOrderValidation: ShowOrderValidation,
    private readonly session: SessionModel
  ) {}

  public async execute(
    requestModel: ShowOrderUseCase.RequestModel
  ): Promise<ShowOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.showOrderValidation(sanitizedRequestModel)

    const filters: Partial<OrderModel>[] = [sanitizedRequestModel]
    const rolesCanSeeAllOrders = ['admin', 'moderator']
    if (!this.session.roles.some((role) => rolesCanSeeAllOrders.includes(role))) {
      filters.push({ userId: this.session.userId })
    }
    const orders = await this.findByOrderRepository.findBy(filters)

    await restValidation({ orders })

    const orderItems = await this.findByOrderItemRepository.findBy([
      { orderId: sanitizedRequestModel.id }
    ])

    return { ...orders[0], ...sanitizedRequestModel, orderItems }
  }

  private sanitizeRequestModel(
    requestModel: ShowOrderUseCase.RequestModel
  ): ShowOrderUseCase.RequestModel {
    return { id: requestModel.id }
  }
}
