import { envConfig } from '@/main/config';

export enum ErrorCodes {
  INTERNAL = 500,
  BAD_REQUEST = 400,
}

export class ApplicationException {
  public name = 'ApplicationException';

  public code = ErrorCodes.INTERNAL;

  public message = 'Something went wrong';

  public details?: Record<string, unknown> | string;

  constructor({ originalError, ...error }: ApplicationException & { originalError?: Error }) {
    const details =
      envConfig.nodeEnv === 'production'
        ? undefined
        : {
            ...(typeof error.details === 'string' ? {} : error.details),
            name: originalError?.name,
            message: originalError?.message,
            stack: originalError?.stack?.split('\n').map((line: string) => line.trim()),
          };

    Object.assign(this, error, { details });
  }
}
