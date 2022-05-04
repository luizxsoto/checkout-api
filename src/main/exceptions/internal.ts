import { ApplicationException, ErrorCodes } from './application';

export class InternalException extends ApplicationException {
  constructor(error: Error) {
    super({
      name: 'InternalException',
      code: ErrorCodes.INTERNAL,
      message: 'Something went wrong',
      originalError: error,
    });
  }
}
