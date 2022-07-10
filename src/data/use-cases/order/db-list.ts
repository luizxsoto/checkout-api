import { maxPerPage, minPerPage } from '@/data/constants';
import { ListOrderRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { OrderModel } from '@/domain/models';
import { ListOrderUseCase } from '@/domain/use-cases';
import { MAX_INTEGER } from '@/main/constants';

export class DbListOrderUseCase implements ListOrderUseCase.UseCase {
  constructor(
    private readonly listOrderRepository: ListOrderRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListOrderUseCase.RequestModel,
      Record<string, unknown[]>
    >,
  ) {}

  public async execute(
    requestModel: ListOrderUseCase.RequestModel,
  ): Promise<ListOrderUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const orders = await this.listOrderRepository.list(sanitizedRequestModel);

    return orders;
  }

  private sanitizeRequestModel(
    requestModel: ListOrderUseCase.RequestModel,
  ): ListOrderUseCase.RequestModel {
    const sanitizedRequestModel: ListOrderUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(requestModel: ListOrderUseCase.RequestModel): Promise<void> {
    await this.validatorService.validate({
      schema: {
        page: [this.validatorService.rules.number(), this.validatorService.rules.min({ value: 1 })],
        perPage: [
          this.validatorService.rules.number(),
          this.validatorService.rules.min({ value: minPerPage }),
          this.validatorService.rules.max({ value: maxPerPage }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({
            values: [
              'customerId',
              'paymentProfileId',
              'status',
              'totalValue',
              'createdAt',
              'updatedAt',
            ],
          }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<OrderModel, 'id' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              customerId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              paymentProfileId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              status: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.in({
                      values: ['AWAITING_PAYMENT', 'PAID', 'NOT_PAID'],
                    }),
                  ],
                }),
              ],
              totalValue: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.integer(),
                    this.validatorService.rules.max({ value: MAX_INTEGER }),
                  ],
                }),
              ],
              createUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              updateUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              createdAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
              updatedAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
            },
          }),
        ],
      },
      model: requestModel,
      data: {},
    });
  }
}
