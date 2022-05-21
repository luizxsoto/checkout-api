import { StatusCodes } from '@/main/constants';
import { ApplicationException } from '@/main/exceptions';

export class DatabaseException extends ApplicationException {
  constructor(error: Error, query?: string) {
    super({
      name: 'DatabaseException',
      code: StatusCodes.INTERNAL,
      message: 'An error ocurred performing a database query',
      originalError: error,
      details: { query },
    });
  }
}
