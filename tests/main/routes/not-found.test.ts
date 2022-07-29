import { Express } from 'express'
import request from 'supertest'

import { setupApp } from '@/main/config'

let app: Express

describe('Not Found Route', () => {
  beforeAll(() => {
    app = setupApp(true)
  })

  test('Should return a correct json for a route not found for all methods', async () => {
    let result = await request(app).get('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body.message).toBe('Route not found')

    result = await request(app).post('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body.message).toBe('Route not found')

    result = await request(app).put('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body.message).toBe('Route not found')

    result = await request(app).delete('/route-not-found').send()
    expect(result.status).toBe(404)
    expect(result.body.message).toBe('Route not found')
  })
})
