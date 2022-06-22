import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateCustomerRepository,
  FindByCustomerRepository,
  ListCustomerRepository,
  RemoveCustomerRepository,
  UpdateCustomerRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { CustomerModel, SessionModel } from '@/domain/models';

type Repositories = FindByCustomerRepository.Repository &
  CreateCustomerRepository.Repository &
  UpdateCustomerRepository.Repository &
  RemoveCustomerRepository.Repository;

export class KnexCustomerRepository extends KnexBaseRepository implements Repositories {
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'customers');
  }

  public async findBy(
    requestModel: FindByCustomerRepository.RequestModel,
  ): Promise<FindByCustomerRepository.ResponseModel> {
    return this.baseFind<CustomerModel>(requestModel);
  }

  public async list(
    requestModel: ListCustomerRepository.RequestModel,
  ): Promise<ListCustomerRepository.ResponseModel> {
    return this.baseList<CustomerModel>(requestModel);
  }

  public async create(
    requestModel: CreateCustomerRepository.RequestModel,
  ): Promise<CreateCustomerRepository.ResponseModel> {
    return this.baseCreate<CustomerModel>(requestModel);
  }

  public async update(
    ...requestModel: UpdateCustomerRepository.RequestModel
  ): Promise<UpdateCustomerRepository.ResponseModel> {
    return this.baseUpdate<CustomerModel>(...requestModel);
  }

  public async remove(
    ...requestModel: RemoveCustomerRepository.RequestModel
  ): Promise<RemoveCustomerRepository.ResponseModel> {
    return this.baseRemove<CustomerModel>(...requestModel);
  }
}
