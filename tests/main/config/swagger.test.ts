import { Express } from 'express'
import { serve } from 'swagger-ui-express'

import { setupSwagger } from '@/main/config'
import { noCache } from '@/main/middlewares'

function makeSut() {
  const express = { use: jest.fn() }
  const sut = setupSwagger

  return { express, sut }
}

describe('Swagger', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should setup swagger', () => {
    const { express, sut } = makeSut()

    sut(express as unknown as Express)

    expect(express.use).toBeCalledTimes(1)
    expect(express.use).toBeCalledWith('/api/docs', noCache, serve, expect.any(Function))
  })
})
