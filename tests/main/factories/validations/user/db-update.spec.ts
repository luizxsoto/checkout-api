import { makeValidationServiceStub } from '@tests/data/stubs/services'
import { makeSessionModelMock, makeUserModelMock } from '@tests/domain/mocks/models'

import { SessionModel } from '@/domain/models'
import { UpdateUserUseCase } from '@/domain/use-cases'
import { ValidationException } from '@/main/exceptions'
import { makeUpdateUserValidation } from '@/main/factories/validations'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'
const nonExistentId = '00000000-0000-4000-8000-000000000002'
const existingUser = makeUserModelMock()

function makeSut(session?: SessionModel) {
  const validationService = makeValidationServiceStub()
  const sut = makeUpdateUserValidation(
    validationService,
    session ?? makeSessionModelMock({ userId: validUuidV4 })
  )

  return { validationService, sut }
}

describe(makeUpdateUserValidation.name, () => {
  describe.each([
    // id
    {
      properties: { id: undefined },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }]
    },
    {
      properties: { id: 1 },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { id: 'invalid_uuid' },
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
    },
    {
      properties: { id: nonExistentId },
      validations: [{ field: 'id', rule: 'exists', message: 'This value was not found' }]
    },
    // name
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { name: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'name',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
          details: { pattern: '/^([a-zA-Z\\u00C0-\\u00FF]+\\s)*[a-zA-Z\\u00C0-\\u00FF]+$/' }
        }
      ]
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' }
      ]
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName'
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' }
      ]
    },
    // email
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
      properties: { email: 'valid@email.com', id: nonExistentId },
      validations: [
        { field: 'id', rule: 'exists', message: 'This value was not found' },
        {
          field: 'email',
          rule: 'unique',
          message: 'This value has already been used',
          details: { findedRegister: existingUser }
        }
      ]
    },
    // password
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
      properties: {
        password: 'Biggest.Password.Biggest.Password.Biggest.Password@1'
      },
      validations: [
        {
          field: 'password',
          rule: 'length',
          message: 'This value length must be beetween 6 and 20'
        }
      ]
    },
    // role
    {
      properties: { role: 1 },
      validations: [{ field: 'role', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { role: 'invalid_role' },
      validations: [
        { field: 'role', rule: 'in', message: 'This value must be in: admin, moderator, customer' }
      ]
    },
    // image
    {
      properties: { image: 1 },
      validations: [{ field: 'image', rule: 'string', message: 'This value must be a string' }]
    },
    {
      properties: { image: 'invalid_url' },
      validations: [
        {
          field: 'image',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: url',
          details: {
            pattern:
              '/[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi'
          }
        }
      ]
    }
  ])(
    'Should throw ValidationException for every user invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { sut } = makeSut()

        const requestModel = {
          id: validUuidV4,
          name: 'Any Name',
          email: 'any@email.com',
          password: 'Password@123',
          role: 'admin',
          image: 'https://any.image',
          ...properties
        } as UpdateUserUseCase.RequestModel

        let sutResult = await sut(requestModel).catch((e) => e)

        if (typeof sutResult === 'function') {
          sutResult = await sutResult({ users: [existingUser] }).catch((e: unknown) => e)
        }

        expect(sutResult).toStrictEqual(new ValidationException(validations))
      })
    }
  )

  it('Should throw ValidationException if provided a role different from customer, but is not admin', async () => {
    const { sut } = makeSut(makeSessionModelMock({ role: 'moderator' }))

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      role: 'moderator',
      image: 'https://any.image'
    } as UpdateUserUseCase.RequestModel

    const sutResult = await sut(requestModel).catch((e) => e)

    expect(sutResult).toStrictEqual(
      new ValidationException([
        {
          field: 'role',
          message: 'Only an admin can provide a role different from customer',
          rule: 'filledRole'
        }
      ])
    )
  })

  it('Should throw ValidationException if provided a user id different from himself, but is not admin', async () => {
    const { sut } = makeSut(makeSessionModelMock({ userId: validUuidV4, role: 'moderator' }))

    const requestModel = {
      id: nonExistentId,
      name: 'Any Name',
      email: 'any@email.com',
      password: 'Password@123',
      role: 'customer',
      image: 'https://any.image'
    } as UpdateUserUseCase.RequestModel

    const sutResult = await sut(requestModel).catch((e) => e)

    expect(sutResult).toStrictEqual(
      new ValidationException([
        {
          field: 'id',
          message: 'Only admin can update users different from himself',
          rule: 'differentId'
        }
      ])
    )
  })
})
