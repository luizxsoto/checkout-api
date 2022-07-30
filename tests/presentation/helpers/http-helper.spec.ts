import { InternalException, NotFoundException } from '@/main/exceptions'
import { created, notFound, ok, serverError } from '@/presentation/helpers'

describe('Http Helpers', () => {
  test('Should return correct values for ok()', () => {
    const body = { anyProp: 'anyValue' }
    const sutResult = ok(body)

    expect(sutResult).toStrictEqual({ statusCode: 200, body })
  })

  test('Should return correct values for created()', () => {
    const body = { anyProp: 'anyValue' }
    const sutResult = created(body)

    expect(sutResult).toStrictEqual({ statusCode: 201, body })
  })

  test('Should return correct values for notFound()', () => {
    const sutResult = notFound()

    expect(sutResult).toStrictEqual({ statusCode: 404, body: new NotFoundException() })
  })

  describe('Should return correct values for serverError()', () => {
    test('Case error is instanceof ApplicationException', () => {
      const error = new InternalException(new Error())
      const sutResult = serverError(error)

      expect(sutResult).toStrictEqual({ statusCode: 500, body: error })
    })

    test('Case error is not instanceof ApplicationException', () => {
      const error = new Error()
      const sutResult = serverError(error)

      expect(sutResult).toStrictEqual({ statusCode: 500, body: new InternalException(error) })
    })
  })
})
