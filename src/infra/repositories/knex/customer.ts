import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateCustomerRepository,
  FindByCustomerRepository,
  UpdateCustomerRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';

type Repositories = FindByCustomerRepository.Repository &
  CreateCustomerRepository.Repository &
  UpdateCustomerRepository.Repository;

export class KnexCustomerRepository extends KnexBaseRepository implements Repositories {
  constructor(knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(knex, uuidService, 'customers');
  }

  public async findBy(
    requestModel: Partial<CustomerModel>,
  ): Promise<FindByCustomerRepository.ResponseModel> {
    const query = this.knex.table(this.tableName).where(requestModel);
    return this.baseFind<CustomerModel>(query);
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
}
