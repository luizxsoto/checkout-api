import { ApplicationException, ErrorCodes } from '@/main/exceptions';

export class DatabaseException extends ApplicationException {
  constructor(error: Error, query?: string) {
    super({
      name: 'DatabaseException',
      code: ErrorCodes.INTERNAL,
      message: 'An error ocurred performing a database query',
      originalError: error,
      details: { query },
    });
  }
}
