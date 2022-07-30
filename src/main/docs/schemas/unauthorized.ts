export const unauthorized = {
  description: 'Unauthorized',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          code: { type: 'integer', example: 401 },
          name: { type: 'string', example: 'InvalidCredentials' },
          message: { type: 'string', example: 'Invalid credentials' }
        }
      }
    }
  }
}
