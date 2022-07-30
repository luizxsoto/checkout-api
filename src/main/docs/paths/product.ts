export const productPaths = {
  '/products': {
    post: {
      tags: ['products'],
      summary: 'Create a new product',
      description: 'Use this route to create a new product',
      security: [{ bearerAuth: [] }],
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
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    get: {
      tags: ['products'],
      summary: 'List all product',
      description: 'Use this route to list all product',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/orderBy' },
        { $ref: '#/components/order' },
        { $ref: '#/components/page' },
        { $ref: '#/components/perPage' },
        { $ref: '#/components/filters' }
      ],
      responses: {
        200: {
          description: 'Ok',
          content: {
            'application/json': { schema: { type: 'array', items: { $ref: '#/schemas/product' } } }
          }
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
