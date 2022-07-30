export const base = {
  type: 'object',
  properties: {
    id: { $ref: '#/schemas/uuid' },
    createUserId: { $ref: '#/schemas/uuid' },
    updateUserId: { $ref: '#/schemas/uuid' },
    deleteUserId: { $ref: '#/schemas/uuid' },
    createdAt: { $ref: '#/schemas/dateTime' },
    updatedAt: { $ref: '#/schemas/dateTime' },
    deletedAt: { $ref: '#/schemas/dateTime' }
  }
}
