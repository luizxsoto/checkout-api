import {
  FindByOrderRepository,
  FindByPaymentProfileRepository,
  UpdateOrderRepository,
} from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { OrderModel, PaymentProfileModel } from '@/domain/models';
import { UpdateOrderUseCase } from '@/domain/use-cases';

export class DbUpdateOrderUseCase implements UpdateOrderUseCase.UseCase {
  constructor(
    private readonly updateOrderRepository: UpdateOrderRepository.Repository,
    private readonly findByOrderRepository: FindByOrderRepository.Repository,
    private readonly findByPaymentProfileRepository: FindByPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      UpdateOrderUseCase.RequestModel,
      { orders: OrderModel[]; paymentProfiles: Omit<PaymentProfileModel, 'data'>[] }
    >,
  ) {}

  public async execute(
    requestModel: UpdateOrderUseCase.RequestModel,
  ): Promise<UpdateOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const orders = await this.findByOrderRepository.findBy([{ id: sanitizedRequestModel.id }]);

    const paymentProfiles = await this.findByPaymentProfileRepository.findBy([
      { id: sanitizedRequestModel.paymentProfileId, userId: sanitizedRequestModel.userId },
    ]);

    await restValidation({ orders, paymentProfiles });

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
      paymentProfileId: requestModel.paymentProfileId,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateOrderUseCase.RequestModel,
  ): Promise<
    (validationData: {
      orders: OrderModel[];
      paymentProfiles: Omit<PaymentProfileModel, 'data'>[];
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
        paymentProfileId: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { orders: [], paymentProfiles: [] },
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
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'userId', dataKey: 'userId' },
                { modelKey: 'paymentProfileId', dataKey: 'id' },
              ],
            }),
          ],
          paymentProfileId: [
            this.validatorService.rules.exists({
              dataEntity: 'paymentProfiles',
              props: [
                { modelKey: 'userId', dataKey: 'userId' },
                { modelKey: 'paymentProfileId', dataKey: 'id' },
              ],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
