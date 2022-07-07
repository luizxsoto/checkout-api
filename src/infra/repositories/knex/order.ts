import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateOrderRepository,
  FindByOrderRepository,
  ListOrderRepository,
  RemoveOrderRepository,
  UpdateOrderRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { OrderModel, SessionModel } from '@/domain/models';

type Repositories = FindByOrderRepository.Repository &
  CreateOrderRepository.Repository &
  UpdateOrderRepository.Repository &
  RemoveOrderRepository.Repository;

export class KnexOrderRepository extends KnexBaseRepository implements Repositories {
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'orders');
  }

  public async findBy(
    requestModel: FindByOrderRepository.RequestModel,
  ): Promise<FindByOrderRepository.ResponseModel> {
    return this.baseFind<OrderModel>(requestModel);
  }

  public async list(
    requestModel: ListOrderRepository.RequestModel,
  ): Promise<ListOrderRepository.ResponseModel> {
    return this.baseList<OrderModel>(requestModel);
  }

  public async create(
    requestModel: CreateOrderRepository.RequestModel,
  ): Promise<CreateOrderRepository.ResponseModel> {
    return this.baseCreate<OrderModel>(requestModel);
  }

  public async update(
    ...requestModel: UpdateOrderRepository.RequestModel
  ): Promise<UpdateOrderRepository.ResponseModel> {
    return this.baseUpdate<OrderModel>(...requestModel);
  }

  public async remove(
    ...requestModel: RemoveOrderRepository.RequestModel
  ): Promise<RemoveOrderRepository.ResponseModel> {
    return this.baseRemove<OrderModel>(...requestModel);
  }
}
