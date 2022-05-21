import { Knex } from 'knex';

import { minPerPage } from '@/data/constants';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { BaseModel } from '@/domain/models';
import { DatabaseException } from '@/main/exceptions';

export abstract class KnexBaseRepository {
  constructor(
    protected readonly knex: Knex,
    protected readonly uuidService: GenerateUniqueIDService.Service,
    protected readonly tableName: string,
  ) {}

  protected async baseRun<T>(query: Knex.QueryBuilder): Promise<T> {
    let queryStr = '';
    try {
      queryStr = query.toQuery();
      return (await query) as T;
    } catch (err) {
      console.error('[KnexBaseRepository.run]', err, queryStr);
      throw new DatabaseException(err, queryStr);
    }
  }

  protected async baseFind<Model extends BaseModel>(
    requestModel: Partial<Model>[],
    withDeleted = false,
  ): Promise<Model[]> {
    const query = this.knex.table(this.tableName);

    query.where((builder) => {
      requestModel.forEach((requestModelItem) => {
        Object.keys(requestModelItem).forEach((requestModelKey) =>
          builder.orWhere(
            requestModelKey,
            requestModelItem[requestModelKey as keyof Partial<Model>] as unknown as string,
          ),
        );
      });
    });

    if (!withDeleted) query.whereNull('deletedAt');

    const rows = await this.baseRun<Model[]>(query);

    return rows;
  }

  protected async baseList<Model extends BaseModel>(
    requestModel: {
      page?: number;
      perPage?: number;
      orderBy?: string;
      order?: string;
    } & Partial<Model>,
    withDeleted = false,
  ): Promise<Model[]> {
    const {
      page = 1,
      perPage = minPerPage,
      orderBy = 'createdAt',
      order = 'asc',
      ...restRequestModel
    } = requestModel;
    const offset = (page - 1) * perPage;

    const query = this.knex
      .table(this.tableName)
      .where(restRequestModel)
      .offset(offset)
      .limit(perPage)
      .orderBy(orderBy, order);
    if (!withDeleted) query.whereNull('deletedAt');

    const rows = await this.baseRun<Model[]>(query);

    return rows;
  }

  protected async baseCreate<Model extends BaseModel>(
    requestModel: Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Model> {
    const createModel = {
      ...requestModel,
      id: this.uuidService.generateUniqueID(),
      createdAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).insert(createModel);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return { ...createModel, ...(typeof result === 'number' ? {} : result[0]) };
  }

  protected async baseUpdate<Model extends BaseModel>(
    where: Partial<Model>,
    requestModel: Partial<Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<Model> {
    const updateModel = {
      ...requestModel,
      updatedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(updateModel).where(where);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return { ...updateModel, ...(typeof result === 'number' ? {} : result[0]) };
  }

  protected async baseRemove<Model extends BaseModel>(where: Partial<Model>): Promise<Model> {
    const removeModel = {
      ...where,
      deletedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(removeModel).where(where);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return { ...removeModel, ...(typeof result === 'number' ? {} : result[0]) };
  }
}
