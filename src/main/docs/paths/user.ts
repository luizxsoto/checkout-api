export const userPaths = {
  '/users': {
    post: {
      tags: ['users'],
      summary: 'Create a new user',
      description:
        'Use this route to create a new user\n\nOnly admin can provide a filled roles array',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/schemas/baseUser' },
                { required: ['name', 'email', 'password', 'roles'] }
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Created',
          content: { 'application/json': { schema: { $ref: '#/schemas/user' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    get: {
      tags: ['users'],
      summary: 'List all user',
      description: 'Use this route to list all user',
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
                  registers: { type: 'array', items: { $ref: '#/schemas/user' } }
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
  '/users/{id}': {
    get: {
      tags: ['users'],
      summary: 'Show a detailed user',
      description: 'Use this route to show a detailed user',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      responses: {
        200: {
          description: 'Ok',
          content: { 'application/json': { schema: { $ref: '#/schemas/user' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    put: {
      tags: ['users'],
      summary: 'Update a existing user',
      description:
        'Use this route to update a existing user\n\nOnly admin can provide a filled roles array',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { allOf: [{ $ref: '#/schemas/baseUser' }] } } }
      },
      responses: {
        200: {
          description: 'Ok',
          content: { 'application/json': { schema: { $ref: '#/schemas/user' } } }
        },
        400: { $ref: '#/schemas/badRequest' },
        401: { $ref: '#/schemas/unauthorized' },
        403: { $ref: '#/schemas/forbidden' },
        404: { $ref: '#/schemas/notFound' },
        500: { $ref: '#/schemas/internal' }
      }
    },
    delete: {
      tags: ['users'],
      summary: 'Remove a existing user',
      description: 'Use this route to remove a existing user',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/id' }],
      responses: {
        200: {
          description: 'Ok',
          content: { 'application/json': { schema: { $ref: '#/schemas/user' } } }
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
