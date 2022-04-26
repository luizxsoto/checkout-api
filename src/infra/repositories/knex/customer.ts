import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import { CreateCustomerRepository } from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';

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
