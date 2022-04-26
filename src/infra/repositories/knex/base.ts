import { Knex } from 'knex';

import { GenerateUniqueIDService } from '@/data/contracts/services';
import { BaseModel } from '@/domain/models';
import { DatabaseException } from '@/infra/exceptions';

export abstract class KnexBaseRepository {
  constructor(
    protected readonly knex: Knex,
    protected readonly uuidService: GenerateUniqueIDService,
    protected readonly tableName: string,
  ) {}

  protected async run<T>(query: Knex.QueryBuilder): Promise<T> {
    let queryStr = '';
    try {
      queryStr = query.toQuery();
      return (await query) as T;
    } catch (err) {
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
    model: Omit<Model, 'id' | 'createdAt'>,
  ): Promise<Model> {
    const query = this.knex
      .table(this.tableName)
      .insert({ ...model, id: this.uuidService.generateUniqueID(), createdAt: new Date() })
      .returning('*');

    const [row] = await this.run<Model[]>(query);

    return row;
  }

  protected async baseUpdate<Model extends BaseModel>(
    where: Partial<Model>,
    model: Omit<Model, 'updatedAt'>,
  ): Promise<Model> {
    const query = this.knex
      .table(this.tableName)
      .update({ ...model, updatedAt: new Date() })
      .where(where)
      .returning('*');

    const [row] = await this.run<Model[]>(query);

    return row;
  }

  protected async baseRemove<Model extends BaseModel>(where: Partial<Model>): Promise<Model> {
    const query = this.knex
      .table(this.tableName)
      .update({ deletedAt: new Date() })
      .where(where)
      .returning('*');

    const [row] = await this.run<Model[]>(query);

    return row;
  }
}
