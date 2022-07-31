import {
  CreateOrderItemRepository,
  CreateOrderRepository,
  FindByProductRepository
} from '@/data/contracts/repositories'
import { CreateOrderValidation } from '@/data/contracts/validations'
import { OrderItemModel, OrderModel, ProductModel, SessionModel } from '@/domain/models'
import { CreateOrderUseCase } from '@/domain/use-cases'

type OrderWithValues = Omit<
  OrderModel,
  'id' | 'createUserId' | 'updateUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  orderItems: Omit<
    OrderItemModel,
    | 'id'
    | 'orderId'
    | 'createUserId'
    | 'updateUserId'
    | 'deleteUserId'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
  >[]
}

export class DbCreateOrderUseCase implements CreateOrderUseCase.UseCase {
  constructor(
    private readonly createOrderRepository: CreateOrderRepository.Repository,
    private readonly createOrderItemRepository: CreateOrderItemRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly createOrderValidation: CreateOrderValidation,
    private readonly session: SessionModel
  ) {}

  public async execute(
    requestModel: CreateOrderUseCase.RequestModel
  ): Promise<CreateOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.createOrderValidation(sanitizedRequestModel)

    const products = await this.findByProductRepository.findBy(
      sanitizedRequestModel.orderItems.map((orderItem) => ({ id: orderItem.productId }))
    )

    await restValidation({ products })

    const { orderItems: orderItemsWithValues, ...orderWithValues } = this.sanitizeValues(
      sanitizedRequestModel,
      products
    )

    const [orderCreated] = await this.createOrderRepository.create([orderWithValues])

    const orderItemsWithOrderId = orderItemsWithValues.map((orderItem) => ({
      ...orderItem,
      orderId: orderCreated.id
    }))

    const orderItemsCreated = await this.createOrderItemRepository.create(orderItemsWithOrderId)

    return {
      ...orderWithValues,
      ...orderCreated,
      orderItems: orderItemsWithOrderId.map((orderItem) => ({
        ...orderItem,
        ...(orderItemsCreated.find(
          (orderItemCreated) => orderItemCreated.productId === orderItem.productId
        ) as OrderItemModel)
      }))
    }
  }

  private sanitizeRequestModel(
    requestModel: CreateOrderUseCase.RequestModel
  ): CreateOrderUseCase.RequestModel {
    const sanitizedRequestModel = {
      userId: this.session.userId,
      orderItems: requestModel.orderItems
    }

    if (
      Array.isArray(requestModel.orderItems) &&
      requestModel.orderItems.every(
        (orderItem) => orderItem && typeof orderItem === 'object' && !Array.isArray(orderItem)
      )
    ) {
      sanitizedRequestModel.orderItems = requestModel.orderItems.map((orderItem) => ({
        productId: orderItem.productId,
        quantity: orderItem.quantity
      }))
    }

    return sanitizedRequestModel
  }

  private sanitizeValues(
    requestModel: CreateOrderUseCase.RequestModel,
    products: ProductModel[]
  ): OrderWithValues {
    const sanitizedOrder = { ...requestModel, totalValue: 0 } as OrderWithValues

    sanitizedOrder.orderItems = sanitizedOrder.orderItems.map((orderItem) => {
      const sanitizedOrderItem = { ...orderItem }
      const findedProduct = products.find(
        (product) => product.id === sanitizedOrderItem.productId
      ) as ProductModel
      sanitizedOrderItem.unitValue = findedProduct.price
      sanitizedOrderItem.totalValue = sanitizedOrderItem.unitValue * sanitizedOrderItem.quantity
      sanitizedOrder.totalValue += sanitizedOrderItem.totalValue

      return sanitizedOrderItem
    })

    return sanitizedOrder
  }
}
