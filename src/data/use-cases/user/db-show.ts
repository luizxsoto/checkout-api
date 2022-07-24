import { FindByUserRepository } from '@/data/contracts/repositories';
import { ValidationService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { ShowUserUseCase } from '@/domain/use-cases';
import { ValidationBuilder } from '@/main/builders';

export class DbShowUserUseCase implements ShowUserUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validationService: ValidationService.Validator,
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
