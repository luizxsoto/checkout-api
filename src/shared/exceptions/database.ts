import { ApplicationException } from './application';

export class DatabaseException extends ApplicationException {
  constructor(error: Error, query?: string) {
    super({
      name: 'DatabaseException',
      code: 'E_DATABASE_EXCEPTION',
      message: 'An error ocurred performing a database query',
      originalError: error,
      details: { query },
    });
  }
}
