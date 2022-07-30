import { Express } from 'express'
import request from 'supertest'

import { setupApp } from '@/main/config'
import { NotFoundException } from '@/main/exceptions'

let app: Express
const notFoundExceptionObject = { ...new NotFoundException() }

describe('Not Found Route', () => {
  beforeAll(() => {
    app = setupApp(true)
  })

  test('Should return a correct json for a route not found for all methods', async () => {
    let result = await request(app).get('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body).toStrictEqual(notFoundExceptionObject)

    result = await request(app).post('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body).toStrictEqual(notFoundExceptionObject)

    result = await request(app).put('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body).toStrictEqual(notFoundExceptionObject)

    result = await request(app).delete('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body).toStrictEqual(notFoundExceptionObject)
  })
})
