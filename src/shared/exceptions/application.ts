import { envConfig } from '../config';

export class ApplicationException {
  public name = 'ApplicationException';

  public code = 'E_APPLICATION_EXCEPTION';

  public message = 'Something went wrong';

  public details?: Record<string, unknown> | string;

  constructor({ originalError, ...error }: ApplicationException & { originalError: Error }) {
    const details =
      envConfig.nodeEnv === 'production'
        ? undefined
        : {
            ...(typeof error.details === 'string' ? {} : error.details),
            name: originalError.name,
            message: originalError.message,
            stack: originalError.stack?.split('\n').map((line: string) => line.trim()),
          };

    Object.assign(this, error, { details });
  }
}
