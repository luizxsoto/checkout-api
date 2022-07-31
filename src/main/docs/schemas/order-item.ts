import { MAX_INTEGER, MAX_ORDER_ITEM_QUANTITY } from '@/main/constants'

export const baseOrderItem = {
  type: 'object',
  properties: {
    productId: { $ref: '#/schemas/uuid' },
    quantity: { type: 'integer', example: 1, minimum: 1, maximum: MAX_ORDER_ITEM_QUANTITY }
  }
}

export const orderItem = {
  allOf: [
    { $ref: '#/schemas/base' },
    { $ref: '#/schemas/baseOrderItem' },
    {
      type: 'object',
      properties: {
        orderId: { $ref: '#/schemas/uuid' },
        unitValue: { type: 'integer', example: 1, maximum: MAX_INTEGER },
        totalValue: { type: 'integer', example: 100, maximum: MAX_INTEGER }
      }
    }
  ]
}
