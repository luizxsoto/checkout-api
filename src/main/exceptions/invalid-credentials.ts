import { StatusCodes } from '@/main/constants'
import { ApplicationException } from '@/main/exceptions'

export class InvalidCredentials extends ApplicationException {
  constructor() {
    super({
      name: 'InvalidCredentials',
      code: StatusCodes.UNAUTHORIZED,
      message: 'Invalid credentials'
    })
  }
}
