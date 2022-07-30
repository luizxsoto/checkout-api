export const forbidden = {
  description: 'Forbidden',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          code: { type: 'integer', example: 403 },
          name: { type: 'string', example: 'InvalidPermissions' },
          message: { type: 'string', example: 'Invalid permissions' }
        }
      }
    }
  }
}
