import {
  FindByOrderRepository,
  RemoveOrderItemRepository,
  RemoveOrderRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { OrderModel } from '@/domain/models';
import { RemoveOrderUseCase } from '@/domain/use-cases';

export class DbRemoveOrderUseCase implements RemoveOrderUseCase.UseCase {
  constructor(
    private readonly removeOrderRepository: RemoveOrderRepository.Repository,
    private readonly removeOrderItemRepository: RemoveOrderItemRepository.Repository,
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      RemoveOrderUseCase.RequestModel,
      { orders: OrderModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveOrderUseCase.RequestModel,
  ): Promise<RemoveOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const orders = await this.findByOrderRepository.findBy([{ id: sanitizedRequestModel.id }]);

    await restValidation({ orders });

    const [orderRemoved] = await this.removeOrderRepository.remove(sanitizedRequestModel);
    const orderitemsRemoved = await this.removeOrderItemRepository.remove({
      orderId: sanitizedRequestModel.id,
    });

    return {
      ...orders[0],
      ...sanitizedRequestModel,
      ...orderRemoved,
      orderItems: orderitemsRemoved,
    };
  }

  private sanitizeRequestModel(
    requestModel: RemoveOrderUseCase.RequestModel,
  ): RemoveOrderUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }

  private async validateRequestModel(
    requestModel: RemoveOrderUseCase.RequestModel,
  ): Promise<(validationData: { orders: OrderModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { orders: [] },
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
        },
        model: requestModel,
        data: validationData,
      });
  }
}
