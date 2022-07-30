import { ApplicationException } from './application'

import { StatusCodes } from '@/main/constants'

export class NotFoundException extends ApplicationException {
  constructor() {
    super({
      name: 'NotFoundException',
      code: StatusCodes.NOT_FOUND,
      message: 'Route not found'
    })
  }
}
