import { FindByOrderItemRepository, FindByOrderRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { OrderModel } from '@/domain/models';
import { ShowOrderUseCase } from '@/domain/use-cases';

export class DbShowOrderUseCase implements ShowOrderUseCase.UseCase {
  constructor(
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly findByOrderItemRepository: FindByOrderItemRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ShowOrderUseCase.RequestModel,
      { orders: OrderModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowOrderUseCase.RequestModel,
  ): Promise<ShowOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const orders = await this.findByOrderRepository.findBy([{ id: sanitizedRequestModel.id }]);

    await restValidation({ orders });

    const orderItems = await this.findByOrderItemRepository.findBy([
      { orderId: sanitizedRequestModel.id },
    ]);

    return { ...orders[0], ...sanitizedRequestModel, orderItems };
  }

  private sanitizeRequestModel(
    requestModel: ShowOrderUseCase.RequestModel,
  ): ShowOrderUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: ShowOrderUseCase.RequestModel,
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
