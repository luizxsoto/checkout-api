import { ListUserRepository } from '@/data/contracts/repositories'
import { ListUserValidation } from '@/data/contracts/validations'
import { ListUserUseCase } from '@/domain/use-cases'

export class DbListUserUseCase implements ListUserUseCase.UseCase {
  constructor(
    private readonly listUserRepository: ListUserRepository.Repository,
    private readonly listUserValidation: ListUserValidation
  ) {}

  public async execute(
    requestModel: ListUserUseCase.RequestModel
  ): Promise<ListUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    await this.listUserValidation(sanitizedRequestModel)

    const users = await this.listUserRepository.list(sanitizedRequestModel)

    return users
  }

  private sanitizeRequestModel(
    requestModel: ListUserUseCase.RequestModel
  ): ListUserUseCase.RequestModel {
    const sanitizedRequestModel: ListUserUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters
    }

    return sanitizedRequestModel
  }
}
