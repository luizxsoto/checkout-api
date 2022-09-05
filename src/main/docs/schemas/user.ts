import {
  MAX_USER_EMAIL_LENGTH,
  MAX_USER_NAME_LENGTH,
  MAX_USER_PASSWORD_LENGTH,
  MIN_USER_EMAIL_LENGTH,
  MIN_USER_NAME_LENGTH,
  MIN_USER_PASSWORD_LENGTH
} from '@/main/constants'

export const baseUser = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Any Name',
      minLength: MIN_USER_NAME_LENGTH,
      maxLength: MAX_USER_NAME_LENGTH
    },
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
    },
    role: { $ref: '#/schemas/role' },
    image: {
      type: 'string',
      example: 'https://boacausa.net/img/image-placeholder.png'
    }
  }
}

export const user = {
  allOf: [{ $ref: '#/schemas/base' }, { $ref: '#/schemas/baseUser' }]
}
