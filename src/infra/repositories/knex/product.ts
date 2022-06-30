import { Knex } from 'knex';

import { KnexBaseRepository } from './base';

import {
  CreateProductRepository,
  FindByProductRepository,
  ListProductRepository,
  RemoveProductRepository,
  UpdateProductRepository,
} from '@/data/contracts/repositories';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { ProductModel, SessionModel } from '@/domain/models';

type Repositories = FindByProductRepository.Repository &
  CreateProductRepository.Repository &
  UpdateProductRepository.Repository &
  RemoveProductRepository.Repository;

export class KnexProductRepository extends KnexBaseRepository implements Repositories {
  constructor(session: SessionModel, knex: Knex, uuidService: GenerateUniqueIDService.Service) {
    super(session, knex, uuidService, 'products');
  }

  public async findBy(
    requestModel: FindByProductRepository.RequestModel,
  ): Promise<FindByProductRepository.ResponseModel> {
    return this.baseFind<ProductModel>(requestModel);
  }

  public async list(
    requestModel: ListProductRepository.RequestModel,
  ): Promise<ListProductRepository.ResponseModel> {
    return this.baseList<ProductModel>(requestModel);
  }

  public async create(
    requestModel: CreateProductRepository.RequestModel,
  ): Promise<CreateProductRepository.ResponseModel> {
    return this.baseCreate<ProductModel>(requestModel);
  }

  public async update(
    ...requestModel: UpdateProductRepository.RequestModel
  ): Promise<UpdateProductRepository.ResponseModel> {
    return this.baseUpdate<ProductModel>(...requestModel);
  }

  public async remove(
    ...requestModel: RemoveProductRepository.RequestModel
  ): Promise<RemoveProductRepository.ResponseModel> {
    return this.baseRemove<ProductModel>(...requestModel);
  }
}
