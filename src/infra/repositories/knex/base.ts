import { Knex } from 'knex';

import { GenerateUniqueIDService } from '@/data/contracts/services';
import { BaseModel } from '@/domain/models';
import { DatabaseException } from '@/infra/exceptions';

export abstract class KnexBaseRepository {
  constructor(
    protected readonly knex: Knex,
    protected readonly uuidService: GenerateUniqueIDService.Service,
    protected readonly tableName: string,
  ) {}

  protected async run<T>(query: Knex.QueryBuilder): Promise<T> {
    let queryStr = '';
    try {
      queryStr = query.toQuery?.();
      return (await query) as T;
    } catch (err) {
      console.error('[KnexBaseRepository.run]', err, queryStr);
      throw new DatabaseException(err, queryStr);
    }
  }

  protected async baseFind<Model extends BaseModel>(
    query: Knex.QueryBuilder,
    withDeleted = false,
  ): Promise<Model[]> {
    if (!withDeleted) query.whereNull('deletedAt');

    const rows = await this.run<Model[]>(query);

    return rows;
  }

  protected async baseCreate<Model extends BaseModel>(
    model: Omit<Model, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Model> {
    const fullModel = {
      ...model,
      id: this.uuidService.generateUniqueID(),
      createdAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).insert(fullModel);

    await this.run<Model[]>(query);

    return fullModel;
  }

  protected async baseUpdate<Model extends BaseModel>(
    where: Partial<Model>,
    model: Omit<Model, 'updatedAt' | 'deletedAt'>,
  ): Promise<Model> {
    const fullModel = {
      ...model,
      updatedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(fullModel).where(where);

    await this.run<Model[]>(query);

    return fullModel;
  }

  protected async baseRemove<Model extends BaseModel>(where: Partial<Model>): Promise<Model> {
    const fullModel = {
      ...where,
      deletedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(fullModel).where(where);

    await this.run<Model[]>(query);

    return fullModel;
  }
}
