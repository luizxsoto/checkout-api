import {
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_PASSWORD_LENGTH
} from '@/main/constants'

export const baseSession = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      example: 'any@email.com',
      minLength: MIN_USER_EMAIL_LENGTH,
      maxLength: MAX_USER_EMAIL_LENGTH
    },
    password: {
      type: 'string',
      example: '@nyP4sSw0rD',
      minLength: MIN_USER_PASSWORD_LENGTH,
      maxLength: MAX_USER_PASSWORD_LENGTH
    }
  }
}

export const session = {
  allOf: [
    { $ref: '#/schemas/user' },
    { type: 'object', properties: { bearerToken: { type: 'string' } } }
  ]
}
