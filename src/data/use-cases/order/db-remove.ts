import {
  FindByOrderRepository,
  RemoveOrderItemRepository,
  RemoveOrderRepository,
} from '@/data/contracts/repositories';
import { RemoveOrderValidation } from '@/data/contracts/validations';
import { RemoveOrderUseCase } from '@/domain/use-cases';

export class DbRemoveOrderUseCase implements RemoveOrderUseCase.UseCase {
  constructor(
    private readonly removeOrderRepository: RemoveOrderRepository.Repository,
    private readonly removeOrderItemRepository: RemoveOrderItemRepository.Repository,
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly removeOrderValidation: RemoveOrderValidation,
  ) {}

  public async execute(
    requestModel: RemoveOrderUseCase.RequestModel,
  ): Promise<RemoveOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.removeOrderValidation(sanitizedRequestModel);

    const orders = await this.findByOrderRepository.findBy([sanitizedRequestModel]);

    await restValidation({ orders });

    const [orderRemoved] = await this.removeOrderRepository.remove(sanitizedRequestModel);
    const orderItemsRemoved = await this.removeOrderItemRepository.remove({
      orderId: sanitizedRequestModel.id,
    });

    return {
      ...orders[0],
      ...sanitizedRequestModel,
      ...orderRemoved,
      orderItems: orderItemsRemoved,
    };
  }

  private sanitizeRequestModel(
    requestModel: RemoveOrderUseCase.RequestModel,
  ): RemoveOrderUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }
}
