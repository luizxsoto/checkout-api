import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateOrderItemRepository,
  FindByOrderItemRepository,
  ListOrderItemRepository,
  RemoveOrderItemRepository,
  UpdateOrderItemRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { OrderItemModel, SessionModel } from '@/domain/models';

type Repositories = FindByOrderItemRepository.Repository &
  CreateOrderItemRepository.Repository &
  UpdateOrderItemRepository.Repository &
  RemoveOrderItemRepository.Repository;

export class KnexOrderItemRepository extends KnexBaseRepository implements Repositories {
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'order_items');
  }

  public async findBy(
    requestModel: FindByOrderItemRepository.RequestModel,
  ): Promise<FindByOrderItemRepository.ResponseModel> {
    return this.baseFind<OrderItemModel>(requestModel);
  }

  public async list(
    requestModel: ListOrderItemRepository.RequestModel,
  ): Promise<ListOrderItemRepository.ResponseModel> {
    return this.baseList<OrderItemModel>(requestModel);
  }

  public async create(
    requestModel: CreateOrderItemRepository.RequestModel,
  ): Promise<CreateOrderItemRepository.ResponseModel> {
    return this.baseCreate<OrderItemModel>(requestModel);
  }

  public async update(
    ...requestModel: UpdateOrderItemRepository.RequestModel
  ): Promise<UpdateOrderItemRepository.ResponseModel> {
    return this.baseUpdate<OrderItemModel>(...requestModel);
  }

  public async remove(
    ...requestModel: RemoveOrderItemRepository.RequestModel
  ): Promise<RemoveOrderItemRepository.ResponseModel> {
    return this.baseRemove<OrderItemModel>(...requestModel);
  }
}
