export const notFound = {
  description: 'Not found',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          code: { type: 'integer', example: 404 },
          name: { type: 'string', example: 'NotFoundException' },
          message: { type: 'string', example: 'Route not found' }
        }
      }
    }
  }
}
