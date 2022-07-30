import { resolve } from 'path'

import { makeBearerTokenMock } from '@tests/domain/mocks/models'
import { Express } from 'express'
import request from 'supertest'

import { knexConfig, setupApp } from '@/main/config'

const validUuidV4 = '10000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000001'
let app: Express

describe('Product Routes', () => {
  beforeAll(async () => {
    app = setupApp()

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('[knexConfig.migrate]', error))
  })

  afterEach(async () => {
    await knexConfig.table('products').del()
  })

  afterAll(async () => {
    await knexConfig.destroy()
  })

  describe('list()', () => {
    test('Should list product and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString()
      }

      await knexConfig.table('products').insert(requestModel)

      const result = await request(app)
        .get('/api/products')
        .query({ filters: `["=", "name", "${requestModel.name}"]` })
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(200)
      expect(result.body.page).toBe(1)
      expect(result.body.perPage).toBe(20)
      expect(result.body.lastPage).toBe(1)
      expect(result.body.total).toBe(1)
      expect(result.body.registers?.[0]?.id).toBe(requestModel.id)
      expect(result.body.registers?.[0]?.name).toBe(requestModel.name)
      expect(result.body.registers?.[0]?.category).toBe(requestModel.category)
      expect(result.body.registers?.[0]?.image).toBe(requestModel.image)
      expect(result.body.registers?.[0]?.price).toBe(requestModel.price)
      expect(result.body.registers?.[0]?.createUserId).toBe(requestModel.createUserId)
      expect(result.body.registers?.[0]?.createdAt).toBe(requestModel.createdAt)
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        filters: 'invalid_filters'
      }

      const result = await request(app)
        .get('/api/products')
        .query(requestModel)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'filters',
            rule: 'listFilters',
            message:
              'This value must be a valid list filters and with this posible fields: name, category, price, createUserId, updateUserId, createdAt, updatedAt'
          }
        ]
      })
    })
  })

  describe('show()', () => {
    test('Should show product and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString()
      }

      await knexConfig.table('products').insert(requestModel)

      const result = await request(app)
        .get(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.category).toBe(requestModel.category)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.price).toBe(requestModel.price)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id'
      }

      const result = await request(app)
        .get(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })

  describe('create()', () => {
    test('Should create product and return correct values', async () => {
      const requestModel = {
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000
      }
      const createUserId = userId

      const result = await request(app)
        .post('/api/products')
        .set('authorization', await makeBearerTokenMock({ userId: createUserId }))
        .send(requestModel)

      expect(result.status).toBe(201)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.category).toBe(requestModel.category)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.price).toBe(requestModel.price)
      expect(result.body.createUserId).toBe(createUserId)
      expect(result.body.id).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      )
      expect(result.body.createdAt).toBeDefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = { category: 'others', image: 'any-image.com', price: 1000 }

      const result = await request(app)
        .post('/api/products')
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel)

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'name',
            rule: 'required',
            message: 'This value is required'
          }
        ]
      })
    })
  })

  describe('update()', () => {
    test('Should update product and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000,
        createUserId: userId,
        createdAt: new Date().toISOString()
      }
      const updateUserId = userId

      await knexConfig.table('products').insert(requestModel)

      const result = await request(app)
        .put(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: updateUserId }))
        .send(requestModel)

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.category).toBe(requestModel.category)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.price).toBe(requestModel.price)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.updateUserId).toBe(updateUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
      expect(result.body.updatedAt).toBeDefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000
      }

      const result = await request(app)
        .put(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel)

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })

  describe('remove()', () => {
    test('Should remove product and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        category: 'others',
        image: 'any-image.com',
        price: 1000,
        createUserId: userId,
        updateUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const deleteUserId = userId

      await knexConfig.table('products').insert(requestModel)

      const result = await request(app)
        .delete(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: deleteUserId }))
        .send()

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.category).toBe(requestModel.category)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.price).toBe(requestModel.price)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.updateUserId).toBe(requestModel.updateUserId)
      expect(result.body.deleteUserId).toBe(deleteUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
      expect(result.body.updatedAt).toBe(requestModel.updatedAt)
      expect(result.body.deletedAt).toBeDefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id'
      }

      const result = await request(app)
        .delete(`/api/products/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })
})
