import { MIN_PER_PAGE, maxPerPage } from '@/data/constants';
import { ListPaymentProfileRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { PaymentProfileModel } from '@/domain/models';
import { ListPaymentProfileUseCase } from '@/domain/use-cases';

export class DbListPaymentProfileUseCase implements ListPaymentProfileUseCase.UseCase {
  constructor(
    private readonly listPaymentProfileRepository: ListPaymentProfileRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListPaymentProfileUseCase.RequestModel,
      Record<string, unknown[]>
    >,
  ) {}

  public async execute(
    requestModel: ListPaymentProfileUseCase.RequestModel,
  ): Promise<ListPaymentProfileUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const paymentProfiles = await this.listPaymentProfileRepository.list(sanitizedRequestModel);

    return paymentProfiles;
  }

  private sanitizeRequestModel(
    requestModel: ListPaymentProfileUseCase.RequestModel,
  ): ListPaymentProfileUseCase.RequestModel {
    const sanitizedRequestModel: ListPaymentProfileUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(
    requestModel: ListPaymentProfileUseCase.RequestModel,
  ): Promise<void> {
    await this.validatorService.validate({
      schema: {
        page: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: 1 }),
        ],
        perPage: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: MIN_PER_PAGE }),
          this.validatorService.rules.max({ value: maxPerPage }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({
            values: ['customerId', 'paymentMethod', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<PaymentProfileModel, 'id' | 'data' | 'deleteUserId' | 'deletedAt'>
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
              paymentMethod: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.in({ values: ['CARD_PAYMENT', 'PHONE_PAYMENT'] }),
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
