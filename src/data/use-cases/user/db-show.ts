import { FindByUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';

export class DbShowUserUseCase implements ShowUserUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ShowUserUseCase.RequestModel,
      { users: Omit<UserModel, 'password'>[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowUserUseCase.RequestModel,
  ): Promise<ShowUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([sanitizedRequestModel], true);

    await restValidation({ users });

    return { ...users[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowUserUseCase.RequestModel,
  ): ShowUserUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: ShowUserUseCase.RequestModel,
  ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> {
    await this.validatorService.validate({
      schema: {
        id: [
          this.validatorService.rules.required(),
          this.validatorService.rules.string(),
          this.validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return (validationData) =>
      this.validatorService.validate({
        schema: {
          id: [
            this.validatorService.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
