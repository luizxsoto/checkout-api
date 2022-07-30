import { Knex } from 'knex'

import { KnexBaseRepository } from './base'

import {
  CreateUserRepository,
  FindByUserRepository,
  ListUserRepository,
  RemoveUserRepository,
  UpdateUserRepository
} from '@/data/contracts/repositories'
import { GenerateUniqueIDService } from '@/data/contracts/services'
import { SessionModel, UserModel } from '@/domain/models'

type Repositories<FindByType = 'NORMAL' | 'SANITIZED'> =
  FindByUserRepository.Repository<FindByType> &
    CreateUserRepository.Repository &
    UpdateUserRepository.Repository &
    RemoveUserRepository.Repository

export class KnexUserRepository<FindByType = 'NORMAL' | 'SANITIZED'>
  extends KnexBaseRepository
  implements Repositories<FindByType>
{
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'users')
  }

  private sanitizeResponse(users: UserModel[]) {
    return users.map(({ password, ...user }) => user)
  }

  public async findBy(
    where: Partial<UserModel>[],
    sanitizeResponse?: boolean
  ): Promise<FindByUserRepository.ResponseModel<FindByType>> {
    const users = await this.baseFind<UserModel>(where)
    if (sanitizeResponse)
      return this.sanitizeResponse(users) as FindByUserRepository.ResponseModel<FindByType>
    return users
  }

  public async list(
    requestModel: ListUserRepository.RequestModel
  ): Promise<ListUserRepository.ResponseModel> {
    return this.baseList<UserModel>(requestModel).then(({ registers, ...listData }) => ({
      ...listData,
      registers: this.sanitizeResponse(registers)
    }))
  }

  public async create(
    requestModel: CreateUserRepository.RequestModel
  ): Promise<CreateUserRepository.ResponseModel> {
    const result = await this.baseCreate<Omit<UserModel, 'roles'> & { roles: string }>(
      requestModel.map((itemModel) => ({
        ...itemModel,
        roles: JSON.stringify(itemModel.roles)
      }))
    )

    return result.map((item) => ({
      ...item,
      roles: requestModel.find((itemModel) => itemModel.email === item.email)
        ?.roles as UserModel['roles']
    }))
  }

  public async update(
    where: Partial<Omit<UserModel, 'roles'>>,
    model: Partial<
      Omit<
        UserModel,
        'id' | 'createUserId' | 'deleteUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
      >
    >
  ): Promise<UpdateUserRepository.ResponseModel> {
    const result = await this.baseUpdate<Omit<UserModel, 'roles'> & { roles?: string }>(where, {
      ...model,
      roles: model.roles && JSON.stringify(model.roles)
    })

    return result as unknown as UpdateUserRepository.ResponseModel
  }

  public async remove(
    ...requestModel: RemoveUserRepository.RequestModel
  ): Promise<RemoveUserRepository.ResponseModel> {
    return this.baseRemove<UserModel>(...requestModel)
  }
}
