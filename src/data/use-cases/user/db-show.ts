import { FindByUserRepository } from '@/data/contracts/repositories';
import { ShowUserValidation } from '@/data/contracts/validations';
import { ShowUserUseCase } from '@/domain/use-cases';

export class DbShowUserUseCase implements ShowUserUseCase.UseCase {
  constructor(
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly showUserValidation: ShowUserValidation,
  ) {}

  public async execute(
    requestModel: ShowUserUseCase.RequestModel,
  ): Promise<ShowUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.showUserValidation(sanitizedRequestModel);

    const users = await this.findByUserRepository.findBy([sanitizedRequestModel], true);

    await restValidation({ users });

    return { ...users[0], ...sanitizedRequestModel };
  }

  private sanitizeRequestModel(
    requestModel: ShowUserUseCase.RequestModel,
  ): ShowUserUseCase.RequestModel {
    return { id: requestModel.id };
  }
}
