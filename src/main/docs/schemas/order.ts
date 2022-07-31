import { MAX_INTEGER } from '@/main/constants'

export const baseOrder = {
  type: 'object',
  properties: {}
}

export const order = {
  allOf: [
    { $ref: '#/schemas/base' },
    { $ref: '#/schemas/baseOrder' },
    {
      type: 'object',
      properties: {
        userId: { $ref: '#/schemas/uuid' },
        totalValue: { type: 'integer', example: 100, maximum: MAX_INTEGER }
      }
    }
  ]
}
