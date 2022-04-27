import { ApplicationException } from './application';

export class InternalException extends ApplicationException {
  constructor(error: Error) {
    super({
      name: 'InternalException',
      code: 'INTERNAL_EXCEPTION',
      message: 'Something went wrong',
      originalError: error,
    });
  }
}
