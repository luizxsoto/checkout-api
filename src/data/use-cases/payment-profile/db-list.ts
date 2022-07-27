import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
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
          this.validatorService.rules.max({ value: MAX_PER_PAGE }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({
            values: ['userId', 'type', 'createdAt', 'updatedAt'],
          }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<
              PaymentProfileModel,
              | 'id'
              | 'brand'
              | 'holderName'
              | 'number'
              | 'firstSix'
              | 'lastFour'
              | 'cvv'
              | 'expiryMonth'
              | 'expiryYear'
              | 'deleteUserId'
              | 'deletedAt'
            >
          >({
            schema: {
              userId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              type: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.in({ values: ['CREDIT', 'DEBIT'] }),
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
