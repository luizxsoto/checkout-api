import { Knex } from 'knex'

import { GenerateUniqueIDService } from '@/data/contracts/services'
import { BaseModel, SessionModel } from '@/domain/models'
import { MIN_PER_PAGE } from '@/main/constants'
import { DatabaseException } from '@/main/exceptions'

type PrimitiveType = string | number
type FilterType = [PrimitiveType, PrimitiveType, PrimitiveType | PrimitiveType[]]
type OperatorType = [string, ...(OperatorType | FilterType)[]]

export abstract class KnexBaseRepository {
  constructor(
    protected readonly session: SessionModel,
    protected readonly knex: Knex,
    protected readonly uuidService: GenerateUniqueIDService.Service,
    protected readonly tableName: string,
    protected readonly arrayFields: string[] = []
  ) {}

  protected async baseRun<ResponseT>(query: Knex.QueryBuilder): Promise<ResponseT> {
    let queryStr = ''
    try {
      queryStr = query.toQuery()
      return (await query) as ResponseT
    } catch (err) {
      console.error('[KnexBaseRepository.run]', err, queryStr)
      throw new DatabaseException(err, queryStr)
    }
  }

  protected async baseFind<Model extends BaseModel>(
    requestModel: Partial<Model>[],
    withDeleted = false
  ): Promise<Model[]> {
    const query = this.knex.table(this.tableName)

    query.where((builder) => {
      requestModel.forEach((requestModelItem) => {
        Object.keys(requestModelItem).forEach((requestModelKey) =>
          builder.orWhere(
            requestModelKey,
            requestModelItem[requestModelKey as keyof Partial<Model>] as any
          )
        )
      })
    })

    if (!withDeleted) query.whereNull('deletedAt')

    const rows = await this.baseRun<Model[]>(query)

    return rows
  }

  protected async baseList<Model extends BaseModel>(
    requestModel: {
      page?: number
      perPage?: number
      orderBy?: string
      order?: string
      filters?: string
    } & Partial<Model>,
    withDeleted = false
  ): Promise<{
    page: number
    perPage: number
    lastPage: number
    total: number
    registers: Model[]
  }> {
    const {
      page = 1,
      perPage = MIN_PER_PAGE,
      orderBy = 'createdAt',
      order = 'desc',
      filters = '[]'
    } = requestModel
    const parsedFilters = JSON.parse(filters.replace(/'/g, "''"))
    const offset = (page - 1) * perPage
    const arrayFields = this.arrayFields

    function putQuotesIfString(value: PrimitiveType) {
      return typeof value === 'string' ? `'${value}'` : value
    }

    function buildQuery(builder: Knex.QueryBuilder, filter: OperatorType | FilterType) {
      const operator = filter[0] as string
      const field = filter[1] as string
      const values = filter[2] as PrimitiveType
      const [, ...fieldOrFilters] = filter

      const operatorsQueryDict: Record<string, () => void> = {
        '&': () =>
          fieldOrFilters.forEach((fieldOrFilter) => {
            builder.where((build) => buildQuery(build, fieldOrFilter as OperatorType | FilterType))
          }),
        '|': () =>
          fieldOrFilters.forEach((fieldOrFilter) => {
            builder.orWhere((build) =>
              buildQuery(build, fieldOrFilter as OperatorType | FilterType)
            )
          }),
        '=': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} = any("${field}")`)
          } else {
            builder.where(field, values)
          }
        },
        '!=': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} != any("${field}")`)
          } else {
            builder.whereNot(field, values)
          }
        },
        '>': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} > any("${field}")`)
          } else {
            builder.where(field, '>', values)
          }
        },
        '>=': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} >= any("${field}")`)
          } else {
            builder.where(field, '>=', values)
          }
        },
        '<': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} < any("${field}")`)
          } else {
            builder.where(field, '<', values)
          }
        },
        '<=': () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(`${putQuotesIfString(values)} <= any("${field}")`)
          } else {
            builder.where(field, '<=', values)
          }
        },
        ':': () =>
          builder.whereRaw(
            `unaccent("${field}"::text) ~* '${values}|${String(values)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}'`
          ),
        '!:': () =>
          builder.whereRaw(
            `unaccent("${field}"::text) !~* '${values}|${String(values)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}'`
          ),
        in: () => {
          if (arrayFields.includes(field)) {
            builder.whereRaw(
              `"${field}" <@ array[${(values as unknown as PrimitiveType[]).map(
                putQuotesIfString
              )}]`
            )
          } else {
            builder.whereIn(field, values as unknown as PrimitiveType[])
          }
        }
      }

      operatorsQueryDict[operator]?.()
    }

    function startQuery(knex: Knex, tableName: string) {
      const query = knex.table(tableName)
      buildQuery(query, parsedFilters)
      if (!withDeleted) query.whereNull('deletedAt')
      return query
    }

    const listQuery = startQuery(this.knex, this.tableName)
    listQuery.offset(offset).limit(perPage).orderBy(orderBy, order)
    const registers = await this.baseRun<Model[]>(listQuery)

    const countQuery = startQuery(this.knex, this.tableName)
    countQuery.count('id as count')
    const [{ count }] = await this.baseRun<{ count: string }[]>(countQuery)

    return {
      page,
      perPage,
      lastPage: Math.ceil(Number(count) / perPage),
      total: Number(count),
      registers
    }
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
    >[]
  ): Promise<Model[]> {
    const createModel = requestModel.map((itemModel) => ({
      ...itemModel,
      id: this.uuidService.generateUniqueID(),
      createUserId: this.session.userId,
      createdAt: new Date()
    })) as Model[]

    const query = this.knex.table(this.tableName).insert(createModel)

    const result = await this.baseRun<Model[]>(query.returning('*'))

    // Type check for sqlite
    return typeof result[0] === 'number'
      ? createModel
      : result.map((item) => ({
          ...createModel.find((itemModel) => itemModel.id === item.id),
          ...item
        }))
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
    >
  ): Promise<Model[]> {
    const updateModel = {
      ...requestModel,
      updateUserId: this.session.userId,
      updatedAt: new Date()
    } as Model

    const query = this.knex.table(this.tableName).update(updateModel).where(where)

    const result = await this.baseRun<Model[]>(query.returning('*'))

    // Type check for sqlite
    return typeof result === 'number'
      ? [updateModel]
      : result.map((item) => ({ ...updateModel, ...item }))
  }

  protected async baseRemove<Model extends BaseModel>(where: Partial<Model>): Promise<Model[]> {
    const removeModel = {
      ...where,
      deleteUserId: this.session.userId,
      deletedAt: new Date()
    } as Model

    const query = this.knex.table(this.tableName).update(removeModel).where(where)

    const result = await this.baseRun<Model[]>(query.returning('*'))

    // Type check for sqlite
    return typeof result === 'number'
      ? [removeModel]
      : result.map((item) => ({ ...removeModel, ...item }))
  }
}
