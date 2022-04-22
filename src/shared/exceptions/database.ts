import { ApplicationException } from './application';

import { envConfig } from '@/shared/config';

export class DatabaseException extends ApplicationException {
  constructor(error: Error, query?: string) {
    super({
      name: 'DatabaseException',
      code: 'E_DATABASE_EXCEPTION',
      message: 'An error ocurred performing a database query',
      details:
        envConfig.nodeEnv === 'production'
          ? undefined
          : { query, stack: error.stack?.split('\n').map((line: string) => line.trim()) },
    });
  }
}
