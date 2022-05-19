import { FindByUserRepository, RemoveUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';

export class DbRemoveUserUseCase implements RemoveUserUseCase.UseCase {
  constructor(
    private readonly removeUserRepository: RemoveUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      RemoveUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveUserUseCase.RequestModel,
  ): Promise<RemoveUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const usersById = await this.findByUserRepository.findBy([{ id: sanitizedRequestModel.id }]);

    await restValidation({ users: usersById });

    const repositoryResult = await this.removeUserRepository.remove(sanitizedRequestModel);

    return { ...usersById[0], ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: RemoveUserUseCase.RequestModel,
  ): RemoveUserUseCase.RequestModel {
    return { id: requestModel.id };
  }

  private async validateRequestModel(
    requestModel: RemoveUserUseCase.RequestModel,
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
