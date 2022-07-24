import { FindByUserRepository, RemoveUserRepository } from '@/data/contracts/repositories';
import { ValidationService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { RemoveUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export class DbRemoveUserUseCase implements RemoveUserUseCase.UseCase {
  constructor(
    private readonly removeUserRepository: RemoveUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validationService: ValidationService.Validator,
  ) {}

  public async execute(
    requestModel: RemoveUserUseCase.RequestModel,
  ): Promise<RemoveUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([sanitizedRequestModel], true);

    await restValidation({ users });

    const [userRemoved] = await this.removeUserRepository.remove(sanitizedRequestModel);

    const responseModel = { ...users[0], ...sanitizedRequestModel, ...userRemoved };
    Reflect.deleteProperty(responseModel, 'password');

    return responseModel;
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
  ): Promise<(validationData: { users: Omit<UserModel, 'password'>[] }) => Promise<void>> {
    await this.validationService.validate({
      schema: {
        id: new ValidationBuilder().required().string().regex({ pattern: 'uuidV4' }).build(),
      },
      model: requestModel,
      data: {},
    });
    return (validationData) =>
      this.validationService.validate({
        schema: {
          id: new ValidationBuilder()
            .exists({ dataEntity: 'users', props: [{ modelKey: 'id', dataKey: 'id' }] })
            .build(),
        },
        model: requestModel,
        data: validationData,
      });
  }
}
