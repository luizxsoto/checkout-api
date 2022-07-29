import { makeSessionModelMock } from '@tests/domain/mocks/models'
import { Request, Response } from 'express'

import { adaptRoute } from '@/main/adapters'

function makeSut() {
  const handle = jest.fn(() => Promise.resolve({ statusCode: 200, body: {} }))
  const makeController = jest.fn(() => ({ handle }))
  const sut = adaptRoute(makeController)

  return { handle, makeController, sut }
}

describe('Express adaptRoute', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should call controller with body / params / query and return correct values', async () => {
    const { handle, makeController, sut } = makeSut()

    const request = {
      body: { bodyProp: 'any_body' },
      params: { paramsProp: 'any_params' },
      query: { queryProp: 'any_query' },
      session: makeSessionModelMock(),
    }
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    const next = jest.fn()
    handle.mockImplementationOnce(() =>
      Promise.resolve({ statusCode: 200, body: { id: 'any_id' } })
    )

    const sutResult = await sut(
      request as unknown as Request,
      response as unknown as Response,
      next
    )

    expect(makeController).toBeCalledWith(request.session)
    expect(handle).toBeCalledWith({ ...request.body, ...request.params, ...request.query })
    expect(response.status).toBeCalledWith(200)
    expect(response.json).toBeCalledWith({ id: 'any_id' })
    expect(sutResult).toBeUndefined()
  })

  test('Should not throw if controller throws', async () => {
    const { handle, sut } = makeSut()

    const request = {}
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    const next = jest.fn()
    const error = new Error()
    handle.mockImplementationOnce(() => {
      throw error
    })

    const sutResult = await sut(
      request as unknown as Request,
      response as unknown as Response,
      next
    )

    expect(next).toBeCalledWith(error)
    expect(sutResult).toBeUndefined()
  })
})
