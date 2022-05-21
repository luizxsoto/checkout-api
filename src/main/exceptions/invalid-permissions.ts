import { StatusCodes } from '@/main/constants';
import { ApplicationException } from '@/main/exceptions';

export class InvalidPermissions extends ApplicationException {
  constructor() {
    super({
      name: 'InvalidPermissions',
      code: StatusCodes.FORBIDDEN,
      message: 'Invalid permissions',
    });
  }
}
