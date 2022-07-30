export const internal = {
  description: 'Internal',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          code: { type: 'integer', example: 500 },
          name: { type: 'string', example: 'InternalException' },
          message: { type: 'string', example: 'Something went wrong' }
        }
      }
    }
  }
}
