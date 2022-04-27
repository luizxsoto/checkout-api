import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import { CreateCustomerRepository, FindByCustomerRepository } from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';

type Repositories = CreateCustomerRepository.Repository & FindByCustomerRepository.Repository;

export class KnexCustomerRepository extends KnexBaseRepository implements Repositories {
  constructor(knex: Knex, uuidService: GenerateUniqueIDService) {
    super(knex, uuidService, 'customers');
  }

  public async create(
    requestModel: CreateCustomerRepository.RequestModel,
  ): Promise<CreateCustomerRepository.ResponseModel> {
    return this.baseCreate<CreateCustomerRepository.ResponseModel>(requestModel);
  }

  public async findBy(
    requestModel: Partial<CustomerModel>,
  ): Promise<FindByCustomerRepository.ResponseModel> {
    const query = this.knex.table(this.tableName).where(requestModel);
    return this.baseFind<CreateCustomerRepository.ResponseModel>(query);
  }
}
