import {
  CreateOrderItemRepository,
  CreateOrderRepository,
  FindByPaymentProfileRepository,
  FindByProductRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import {
  OrderItemModel,
  OrderModel,
  OrderStatus,
  PaymentProfileModel,
  ProductModel,
} from '@/domain/models';
import { CreateOrderUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';

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
  >[];
};

export class DbCreateOrderUseCase implements CreateOrderUseCase.UseCase {
  constructor(
    private readonly createOrderRepository: CreateOrderRepository.Repository,
    private readonly createOrderItemRepository: CreateOrderItemRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly findByProductRepository: FindByProductRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      CreateOrderUseCase.RequestModel,
      { paymentProfiles: Omit<PaymentProfileModel, 'data'>[]; products: ProductModel[] }
    >,
  ) {}

  public async execute(
    requestModel: CreateOrderUseCase.RequestModel,
  ): Promise<CreateOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy([
      { id: sanitizedRequestModel.paymentProfileId, customerId: sanitizedRequestModel.customerId },
    ]);

    const products = await this.findByProductRepository.findBy(
      sanitizedRequestModel.orderItems.map((orderItem) => ({ id: orderItem.productId })),
    );

    await restValidation({ paymentProfiles, products });

    const { orderItems: orderItemsWithValue, ...orderWithValues } = this.sanitizeValues(
      sanitizedRequestModel,
      products,
    );

    const orderCreated = await this.createOrderRepository.create(orderWithValues);

    const orderItemsWithOrderId = orderItemsWithValue.map((orderItem) => ({
      ...orderItem,
      orderId: orderCreated.id,
    }));

    const orderItemsCreated = await Promise.all(
      orderItemsWithOrderId.map((orderItem) => this.createOrderItemRepository.create(orderItem)),
    );

    return {
      ...orderWithValues,
      ...orderCreated,
      orderItems: orderItemsWithOrderId.map((orderItem) => ({
        ...orderItem,
        ...(orderItemsCreated.find(
          (orderItemCreated) => orderItemCreated.productId === orderItem.productId,
        ) as OrderItemModel),
      })),
    };
  }

  private sanitizeRequestModel(
    requestModel: CreateOrderUseCase.RequestModel,
  ): CreateOrderUseCase.RequestModel & { status: OrderStatus } {
    const sanitizedRequestModel = {
      customerId: requestModel.customerId,
      paymentProfileId: requestModel.paymentProfileId,
      orderItems: requestModel.orderItems,
      status: 'AWAITING_PAYMENT' as const,
    };

    if (
      Array.isArray(requestModel.orderItems) &&
      requestModel.orderItems.every(
        (orderItem) => orderItem && typeof orderItem === 'object' && !Array.isArray(orderItem),
      )
    ) {
      sanitizedRequestModel.orderItems = requestModel.orderItems.map((orderItem) => ({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      }));
    }

    return sanitizedRequestModel;
  }

  private sanitizeValues(
    requestModel: CreateOrderUseCase.RequestModel,
    products: ProductModel[],
  ): OrderWithValues {
    const sanitizedOrder = { ...requestModel, totalValue: 0 } as OrderWithValues;

    sanitizedOrder.orderItems = sanitizedOrder.orderItems.map((orderItem) => {
      const sanitizedOrderItem = { ...orderItem };
      const findedProduct = products.find(
        (product) => product.id === sanitizedOrderItem.productId,
      ) as ProductModel;
      sanitizedOrderItem.unitValue = findedProduct.price;
      sanitizedOrderItem.totalValue = sanitizedOrderItem.unitValue * sanitizedOrderItem.quantity;
      sanitizedOrder.totalValue += sanitizedOrderItem.totalValue;

      return sanitizedOrderItem;
    });

    return sanitizedOrder;
  }

  private async validateRequestModel(
    requestModel: CreateOrderUseCase.RequestModel,
  ): Promise<
    (validationData: {
      paymentProfiles: Omit<PaymentProfileModel, 'data'>[];
      products: ProductModel[];
    }) => Promise<void>
  > {
    await this.validatorService.validate({
      schema: {
        customerId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        paymentProfileId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        orderItems: [
          this.validatorService.rules.array({
            rules: [
              this.validatorService.rules.object({
                schema: {
                  productId: [
                    this.validatorService.rules.required(),
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                  quantity: [
                    this.validatorService.rules.required(),
                    this.validatorService.rules.integer(),
                    this.validatorService.rules.min({ value: 1 }),
                    this.validatorService.rules.max({ value: MAX_INTEGER }),
                  ],
                },
              }),
            ],
          }),
          this.validatorService.rules.distinct({
            keys: ['productId'],
          }),
        ],
      },
      model: requestModel,
      data: { paymentProfiles: [], products: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          customerId: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'customerId', dataKey: 'customerId' },
                { modelKey: 'paymentProfileId', dataKey: 'id' },
              ],
            }),
          ],
          paymentProfileId: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'customerId', dataKey: 'customerId' },
                { modelKey: 'paymentProfileId', dataKey: 'id' },
              ],
            }),
          ],
          orderItems: [
            this.validatorService.rules.array({
              rules: [
                this.validatorService.rules.object({
                  schema: {
                    productId: [
                      this.validatorService.rules.exists({
                        dataEntity: 'products',
                        props: [{ modelKey: 'productId', dataKey: 'id' }],
                      }),
                    ],
                    quantity: [],
                  },
                }),
              ],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
