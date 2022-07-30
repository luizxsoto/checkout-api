import {
  FindByOrderRepository,
  FindByUserRepository,
  UpdateOrderRepository
} from '@/data/contracts/repositories'
import { UpdateOrderValidation } from '@/data/contracts/validations'
import { UpdateOrderUseCase } from '@/domain/use-cases'

export class DbUpdateOrderUseCase implements UpdateOrderUseCase.UseCase {
  constructor(
    private readonly updateOrderRepository: UpdateOrderRepository.Repository,
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly updateOrderValidation: UpdateOrderValidation
  ) {}

  public async execute(
    requestModel: UpdateOrderUseCase.RequestModel
  ): Promise<UpdateOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.updateOrderValidation(sanitizedRequestModel)

    const orders = await this.findByOrderRepository.findBy([{ id: sanitizedRequestModel.id }])

    const users = await this.findByUserRepository.findBy(
      [{ id: sanitizedRequestModel.userId }],
      true
    )

    await restValidation({ orders, users })

    const [orderUpdated] = await this.updateOrderRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel
    )

    const findedOrderById = orders.find((order) => order.id === sanitizedRequestModel.id)

    return { ...findedOrderById, ...sanitizedRequestModel, ...orderUpdated }
  }

  private sanitizeRequestModel(
    requestModel: UpdateOrderUseCase.RequestModel
  ): UpdateOrderUseCase.RequestModel {
    return {
      id: requestModel.id,
      userId: requestModel.userId
    }
  }
}
