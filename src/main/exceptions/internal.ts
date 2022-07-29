import { ApplicationException } from './application'

import { StatusCodes } from '@/main/constants'

export class InternalException extends ApplicationException {
  constructor(error: Error) {
    super({
      name: 'InternalException',
      code: StatusCodes.INTERNAL,
      message: 'Something went wrong',
      originalError: error,
    })
  }
}
