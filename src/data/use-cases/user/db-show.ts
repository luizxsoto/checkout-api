import { FindByUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';

export class DbShowUserUseCase implements ShowUserUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      ShowUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
  ) {}

  public async execute(
    requestModel: ShowUserUseCase.RequestModel,
  ): Promise<ShowUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ id: sanitizedRequestModel.id }]);

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
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
    await this.validator.validate({
      schema: {
        id: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'uuidV4' }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return (validationData) =>
      this.validator.validate({
        schema: {
          id: [
            this.validator.rules.exists({
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
