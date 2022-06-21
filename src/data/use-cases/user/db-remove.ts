import { FindByUserRepository, RemoveUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';

export class DbRemoveUserUseCase implements RemoveUserUseCase.UseCase {
  constructor(
    private readonly removeUserRepository: RemoveUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      RemoveUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
  ) {}

  public async execute(
    requestModel: RemoveUserUseCase.RequestModel,
  ): Promise<RemoveUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([{ id: sanitizedRequestModel.id }]);

    await restValidation({ users });

    const repositoryResult = await this.removeUserRepository.remove(sanitizedRequestModel);

    return { ...users[0], ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: RemoveUserUseCase.RequestModel,
  ): RemoveUserUseCase.RequestModel {
    return {
      id: requestModel.id,
    };
  }

  private async validateRequestModel(
    requestModel: RemoveUserUseCase.RequestModel,
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
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
