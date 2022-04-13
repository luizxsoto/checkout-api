import { ApplicationException } from './application';

export class DatabaseException extends ApplicationException {
  constructor(error: Error, query?: string) {
    super({
      name: 'DatabaseException',
      code: 'E_DATABASE_EXCEPTION',
      message: 'An error ocurred performing a database query',
      details:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { query, stack: error.stack?.split('\n').map((line: string) => line.trim()) },
    });
  }
}
