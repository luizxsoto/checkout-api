import { Knex } from 'knex';

import { CreateCustomerRepository } from '@/customers/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/shared/contracts/services';
import { KnexBaseRepository } from '@/shared/repositories';

type Repositories = CreateCustomerRepository.Repository;

export class KnexCustomerRepository extends KnexBaseRepository implements Repositories {
  constructor(knex: Knex, uuidService: GenerateUniqueIDService) {
    super(knex, uuidService, 'customers');
  }

  public async create(
    params: CreateCustomerRepository.RequestModel,
  ): Promise<CreateCustomerRepository.ResponseModel> {
    return this.baseCreate<CreateCustomerRepository.ResponseModel>(params);
  }
}
