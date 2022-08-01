export const sessionPaths = {
  '/sessions': {
    post: {
      tags: ['sessions'],
      summary: 'Create a new session',
      description: 'Use this route to create a new session',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              allOf: [{ $ref: '#/schemas/baseSession' }, { required: ['email', 'password'] }]
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Created',
          content: { 'application/json': { schema: { $ref: '#/schemas/session' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    }
  }
}
