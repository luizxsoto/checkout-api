export const orderPaths = {
  '/orders': {
    post: {
      tags: ['orders'],
      summary: 'Create a new order',
      description: 'Use this route to create a new order',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/schemas/baseOrder' },
                {
                  type: 'object',
                  properties: {
                    orderItems: { type: 'array', items: { $ref: '#/schemas/baseOrderItem' } }
                  },
                  required: ['orderItems']
                }
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Created',
          content: { 'application/json': { schema: { $ref: '#/schemas/order' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    get: {
      tags: ['orders'],
      summary: 'List all order',
      description: 'Use this route to list all order',
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
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  perPage: { type: 'integer', example: 20 },
                  lastPage: { type: 'integer', example: 1 },
                  total: { type: 'integer', example: 1 },
                  registers: { type: 'array', items: { $ref: '#/schemas/order' } }
                }
              }
            }
          }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    }
  },
  '/orders/{id}': {
    get: {
      tags: ['orders'],
      summary: 'Show a detailed order',
      description: 'Use this route to show a detailed order',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      responses: {
        200: {
          description: 'Ok',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/schemas/order' },
                  {
                    type: 'object',
                    properties: {
                      orderItems: { type: 'array', items: { $ref: '#/schemas/orderItem' } }
                    }
                  }
                ]
              }
            }
          }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    put: {
      tags: ['orders'],
      summary: 'Update a existing order',
      description: 'Use this route to update a existing order',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { userId: { $ref: '#/schemas/uuid' } },
              required: ['userId']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Ok',
          content: { 'application/json': { schema: { $ref: '#/schemas/order' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    delete: {
      tags: ['orders'],
      summary: 'Remove a existing order',
      description: 'Use this route to remove a existing order',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      responses: {
        200: {
          description: 'Ok',
          content: { 'application/json': { schema: { $ref: '#/schemas/order' } } }
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
