export const badRequest = {
  description: 'Bad request',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          code: { type: 'integer', example: 400 },
          name: { type: 'string', example: 'ValidationException' },
          message: { type: 'string', example: 'An error ocurred performing a validation' }
        }
      }
    }
  }
}
