import { Knex } from 'knex';

import { minPerPage } from '@/data/constants';
import { GenerateUniqueIDService } from '@/data/contracts/services';
import { BaseModel, SessionModel } from '@/domain/models';
import { DatabaseException } from '@/main/exceptions';

export abstract class KnexBaseRepository {
  constructor(
    protected readonly session: SessionModel,
    protected readonly knex: Knex,
    protected readonly uuidService: GenerateUniqueIDService.Service,
    protected readonly tableName: string,
  ) {}

  protected async baseRun<ResponseT>(query: Knex.QueryBuilder): Promise<ResponseT> {
    let queryStr = '';
    try {
      queryStr = query.toQuery();
      return (await query) as ResponseT;
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
            requestModelItem[requestModelKey as keyof Partial<Model>] as any,
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
      filters?: string;
    } & Partial<Model>,
    withDeleted = false,
  ): Promise<Model[]> {
    const {
      page = 1,
      perPage = minPerPage,
      orderBy = 'createdAt',
      order = 'desc',
      filters = '[]',
    } = requestModel;
    const offset = (page - 1) * perPage;

    type PrimitiveType = string | number;
    type FilterType = [PrimitiveType, PrimitiveType, PrimitiveType | PrimitiveType[]];
    type OperatorType = [string, ...(OperatorType | FilterType)[]];

    function buildQuery(builder: Knex.QueryBuilder, filter: OperatorType | FilterType) {
      const [operator, field, values] = filter;
      const [, ...fieldOrFilters] = filter;

      const operatorsQueryDict: Record<string, () => void> = {
        '&': () =>
          fieldOrFilters.forEach((fieldOrFilter) => {
            builder.where((build) => buildQuery(build, fieldOrFilter as OperatorType | FilterType));
          }),
        '|': () =>
          fieldOrFilters.forEach((fieldOrFilter) => {
            builder.orWhere((build) =>
              buildQuery(build, fieldOrFilter as OperatorType | FilterType),
            );
          }),
        '=': () => builder.where(field as string, values as PrimitiveType),
        '!=': () => builder.whereNot(field as string, values as PrimitiveType),
        '>': () => builder.where(field as string, '>', values as PrimitiveType),
        '>=': () => builder.where(field as string, '>=', values as PrimitiveType),
        '<': () => builder.where(field as string, '<', values as PrimitiveType),
        '<=': () => builder.where(field as string, '<=', values as PrimitiveType),
        ':': () =>
          builder.whereRaw(
            `"${field}"::text ~* '${values}|${String(values)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}'`,
          ),
        '!:': () =>
          builder.whereRaw(
            `"${field}"::text !~* '${values}|${String(values)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}'`,
          ),
        in: () => builder.whereIn(field as string, values as PrimitiveType[]),
      };

      operatorsQueryDict[operator]?.();
    }

    const query = this.knex.table(this.tableName);
    buildQuery(query, JSON.parse(filters.replace(/'/g, "''")));
    query.offset(offset).limit(perPage).orderBy(orderBy, order);
    if (!withDeleted) query.whereNull('deletedAt');

    const rows = await this.baseRun<Model[]>(query);

    return rows;
  }

  protected async baseCreate<Model extends BaseModel>(
    requestModel: Omit<
      Model,
      | 'id'
      | 'createUserId'
      | 'updateUserId'
      | 'deleteUserId'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ): Promise<Model> {
    const createModel = {
      ...requestModel,
      id: this.uuidService.generateUniqueID(),
      createUserId: this.session.userId,
      createdAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).insert(createModel);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return { ...createModel, ...(typeof result === 'number' ? {} : result[0]) };
  }

  protected async baseUpdate<Model extends BaseModel>(
    where: Partial<Model>,
    requestModel: Partial<
      Omit<
        Model,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      >
    >,
  ): Promise<Model[]> {
    const updateModel = {
      ...requestModel,
      updateUserId: this.session.userId,
      updatedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(updateModel).where(where);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return typeof result === 'number'
      ? [updateModel]
      : result.map((item) => ({ ...updateModel, ...item }));
  }

  protected async baseRemove<Model extends BaseModel>(where: Partial<Model>): Promise<Model[]> {
    const removeModel = {
      ...where,
      deleteUserId: this.session.userId,
      deletedAt: new Date(),
    } as Model;

    const query = this.knex.table(this.tableName).update(removeModel).where(where);

    const result = await this.baseRun<Model[]>(query.returning('*'));

    return typeof result === 'number'
      ? [removeModel]
      : result.map((item) => ({ ...removeModel, ...item }));
  }
}
