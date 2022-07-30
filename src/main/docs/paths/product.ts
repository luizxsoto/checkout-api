export const productPaths = {
  post: {
    tags: ['products'],
    summary: 'Create a new product',
    description: 'Use this route for create a new product',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/schemas/baseProduct' },
              { required: ['name', 'category', 'image', 'price'] }
            ]
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Created',
        content: { 'application/json': { schema: { $ref: '#/schemas/product' } } }
      },
      400: { $ref: '#/components/badRequest' },
      401: { $ref: '#/components/unauthorized' },
      403: { $ref: '#/components/forbidden' },
      404: { $ref: '#/components/notFound' },
      500: { $ref: '#/components/internal' }
    }
  }
}
