import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel, SessionModel } from '@/domain/models';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export class DbCreateCustomerUseCase implements CreateCustomerUseCase.UseCase {
  constructor(
    private readonly session: SessionModel,
    private readonly createCustomerRepository: CreateCustomerRepository.Repository,
    private readonly findByCustomerRepository: FindByCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      Partial<CreateCustomerUseCase.RequestModel>,
      { customers: CustomerModel[] }
    >,
  ) {}

  public async execute(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<CreateCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const customers = await this.findByCustomerRepository.findBy([
      { email: sanitizedRequestModel.email },
    ]);

    await restValidation({ customers });

    const repositoryResult = await this.createCustomerRepository.create(sanitizedRequestModel);

    return { ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): CreateCustomerUseCase.RequestModel & { createUserId: string } {
    return {
      name: requestModel.name,
      email: requestModel.email,
      createUserId: this.session.userId,
    };
  }

  private async validateRequestModel(
    requestModel: CreateCustomerUseCase.RequestModel,
  ): Promise<(validationData: { customers: CustomerModel[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        name: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'name' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'email' }),
          this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: requestModel,
      data: { customers: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          name: [],
          email: [
            this.validatorService.rules.unique({
              dataEntity: 'customers',
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
