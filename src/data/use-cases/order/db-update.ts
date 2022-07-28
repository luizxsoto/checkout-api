import {
  FindByOrderRepository,
  FindByUserRepository,
  UpdateOrderRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { OrderModel, UserModel } from '@/domain/models';
import { UpdateOrderUseCase } from '@/domain/use-cases';

export class DbUpdateOrderUseCase implements UpdateOrderUseCase.UseCase {
  constructor(
    private readonly updateOrderRepository: UpdateOrderRepository.Repository,
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdateOrderUseCase.RequestModel,
      { orders: OrderModel[]; users: Omit<UserModel, 'password'>[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdateOrderUseCase.RequestModel,
  ): Promise<UpdateOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const orders = await this.findByOrderRepository.findBy([{ id: sanitizedRequestModel.id }]);

    const users = await this.findByUserRepository.findBy(
      [{ id: sanitizedRequestModel.userId }],
      true,
    );

    await restValidation({ orders, users });

    const [orderUpdated] = await this.updateOrderRepository.update(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );

    const findedOrderById = orders.find((order) => order.id === sanitizedRequestModel.id);

    return { ...findedOrderById, ...sanitizedRequestModel, ...orderUpdated };
  }

  private sanitizeRequestModel(
    requestModel: UpdateOrderUseCase.RequestModel,
  ): UpdateOrderUseCase.RequestModel {
    return {
      id: requestModel.id,
      userId: requestModel.userId,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateOrderUseCase.RequestModel,
  ): Promise<
    (validationData: {
      orders: OrderModel[];
      users: Omit<UserModel, 'password'>[];
    }) => Promise<void>
  > {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        userId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { orders: [], users: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'orders',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
          userId: [
            this.validatorService.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'userId', dataKey: 'id' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
