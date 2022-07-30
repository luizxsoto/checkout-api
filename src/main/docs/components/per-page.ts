import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/main/constants'

export const perPage = {
  in: 'query',
  name: 'perPage',
  description: 'Number of registers per page',
  schema: { type: 'integer', example: 20, minimum: MIN_PER_PAGE, maximum: MAX_PER_PAGE }
}
