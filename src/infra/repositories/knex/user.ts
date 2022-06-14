import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateUserRepository,
  FindByUserRepository,
  ListUserRepository,
  RemoveUserRepository,
  UpdateUserRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';

type Repositories = FindByUserRepository.Repository &
  CreateUserRepository.Repository &
  UpdateUserRepository.Repository &
  RemoveUserRepository.Repository;

export class KnexUserRepository extends KnexBaseRepository implements Repositories {
  constructor(knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(knex, uuidService, 'users');
  }

  public async findBy(
    requestModel: FindByUserRepository.RequestModel,
  ): Promise<FindByUserRepository.ResponseModel> {
    return this.baseFind<UserModel>(requestModel);
  }

  public async list(
    requestModel: ListUserRepository.RequestModel,
  ): Promise<ListUserRepository.ResponseModel> {
    return this.baseList<UserModel>(requestModel);
  }

  public async create(
    requestModel: CreateUserRepository.RequestModel,
  ): Promise<CreateUserRepository.ResponseModel> {
    const result = await this.baseCreate<Omit<UserModel, 'roles'> & { roles: string }>({
      ...requestModel,
      roles: JSON.stringify(requestModel.roles),
    });

    return { ...result, roles: requestModel.roles };
  }

  public async update(
    where: Partial<Omit<UserModel, 'roles'>>,
    model: Partial<
      Omit<UserModel, 'id' | 'createUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<UpdateUserRepository.ResponseModel> {
    const result = await this.baseUpdate<Omit<UserModel, 'roles'> & { roles: string }>(where, {
      ...model,
      roles: model.roles && JSON.stringify(model.roles),
    });

    return result as unknown as UpdateUserRepository.ResponseModel;
  }

  public async remove(
    ...requestModel: RemoveUserRepository.RequestModel
  ): Promise<RemoveUserRepository.ResponseModel> {
    return this.baseRemove<UserModel>(...requestModel);
  }
}
