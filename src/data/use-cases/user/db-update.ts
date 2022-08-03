import { Hasher } from '@/data/contracts/cryptography'
import { FindByUserRepository, UpdateUserRepository } from '@/data/contracts/repositories'
import { UpdateUserValidation } from '@/data/contracts/validations'
import { UserModel } from '@/domain/models'
import { UpdateUserUseCase } from '@/domain/use-cases'

export class DbUpdateUserUseCase implements UpdateUserUseCase.UseCase {
  constructor(
    private readonly updateUserRepository: UpdateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly updateUserValidation: UpdateUserValidation,
    private readonly hasher: Hasher
  ) {}

  public async execute(
    requestModel: UpdateUserUseCase.RequestModel
  ): Promise<UpdateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel)

    const restValidation = await this.updateUserValidation(sanitizedRequestModel)

    const filters: Partial<UserModel>[] = [{ id: sanitizedRequestModel.id }]

    if (sanitizedRequestModel.email) filters.push({ email: sanitizedRequestModel.email })

    const users = await this.findByUserRepository.findBy(filters, true)

    await restValidation({ users })

    const [userUpdated] = await this.updateUserRepository.update(
      { id: sanitizedRequestModel.id },
      {
        ...sanitizedRequestModel,
        password:
          sanitizedRequestModel.password && (await this.hasher.hash(sanitizedRequestModel.password))
      }
    )

    const findedUserById = users.find((user) => user.id === sanitizedRequestModel.id)

    const responseModel = { ...findedUserById, ...sanitizedRequestModel, ...userUpdated }
    Reflect.deleteProperty(responseModel, 'password')

    return responseModel
  }

  private sanitizeRequestModel(
    requestModel: UpdateUserUseCase.RequestModel
  ): UpdateUserUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      email: requestModel.email,
      password: requestModel.password,
      role: requestModel.role
    }
  }
}
