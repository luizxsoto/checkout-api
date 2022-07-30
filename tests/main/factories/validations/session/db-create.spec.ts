import { makeHashCompareCryptographyStub } from '@tests/data/stubs/cryptography'
import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeUserModelMock } from '@tests/domain/mocks/models'

import { CreateSessionUseCase } from '@/domain/use-cases'
import { ValidationException } from '@/main/exceptions'
import { makeCreateSessionValidation } from '@/main/factories/validations'

const existingUser = makeUserModelMock()

function makeSut() {
  const validationService = makeValidationServiceStub()
  const hashCompareCryptography = makeHashCompareCryptographyStub()
  const sut = makeCreateSessionValidation(validationService, hashCompareCryptography)

  return { validationService, sut }
}

describe(makeCreateSessionValidation.name, () => {
  describe.each([
    // email
    {
      properties: { email: undefined },
      validations: [{ field: 'email', rule: 'required', message: 'This value is required' }]
    },
    {
      properties: { email: 1 },
      validations: [{ field: 'email', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { email: ' InV@L1D eM@1L ' },
      validations: [
        {
          field: 'email',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: email',
          details: { pattern: '/^[\\w+.]+@\\w+\\.\\w{2,}(?:\\.\\w{2})?$/' }
        }
      ]
    },
    {
      properties: {
        email:
          'biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email@invalid.com'
      },
      validations: [
        { field: 'email', rule: 'length', message: 'This value length must be beetween 6 and 100' }
      ]
    },
    {
      properties: { email: 'any@email.com' },
      validations: [{ field: 'email', rule: 'exists', message: 'This value was not found' }]
    },
    // password
    {
      properties: { password: undefined },
      validations: [{ field: 'password', rule: 'required', message: 'This value is required' }]
    },
    {
      properties: { password: 1 },
      validations: [{ field: 'password', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { password: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'password',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: password',
          details: {
            pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/'
          }
        }
      ]
    },
    {
      properties: { password: 'L0we!' },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20'
        }
      ]
    },
    {
      properties: { password: 'Biggest.Password.Biggest.Password.Biggest.Password@1' },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20'
        }
      ]
    },
    {
      properties: { password: '0ther@Password' },
      validations: [{ field: 'password', rule: 'password', message: 'Wrong password' }]
    }
  ])(
    'Should throw ValidationException for every session invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          email: 'valid@email.com',
          password: 'Password@123',
          ...properties
        } as CreateSessionUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ users: [existingUser] }).catch((e: unknown) => e)
        }

        if (typeof sutResult === 'function') {
          sutResult = await sutResult(existingUser).catch((e: unknown) => e)
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )
})
