import { FindByUserRepository, RemoveUserRepository } from '@/data/contracts/repositories'
import { RemoveUserValidation } from '@/data/contracts/validations'
import { RemoveUserUseCase } from '@/domain/use-cases'

export class DbRemoveUserUseCase implements RemoveUserUseCase.UseCase {
  constructor(
    private readonly removeUserRepository: RemoveUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly removeUserValidation: RemoveUserValidation
  ) {}

  public async execute(
    requestModel: RemoveUserUseCase.RequestModel
  ): Promise<RemoveUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.removeUserValidation(sanitizedRequestModel)

    const users = await this.findByUserRepository.findBy([sanitizedRequestModel], true)

    await restValidation({ users })

    const [userRemoved] = await this.removeUserRepository.remove(sanitizedRequestModel)

    const responseModel = { ...users[0], ...sanitizedRequestModel, ...userRemoved }
    Reflect.deleteProperty(responseModel, 'password')

    return responseModel
  }

  private sanitizeRequestModel(
    requestModel: RemoveUserUseCase.RequestModel
  ): RemoveUserUseCase.RequestModel {
    return {
      id: requestModel.id,
    }
  }
}
