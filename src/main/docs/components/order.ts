export const order = {
  in: 'query',
  name: 'order',
  description: 'Order of result',
  schema: { type: 'string', enum: ['asc', 'desc'], example: 'asc' }
}
