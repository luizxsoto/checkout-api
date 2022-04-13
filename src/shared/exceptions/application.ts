export class ApplicationException {
  public name = 'ApplicationException';

  public code = 'E_APPLICATION_EXCEPTION';

  public message = 'Something went wrong';

  public details?: Record<string, unknown> | string;

  constructor(error: ApplicationException) {
    Object.assign(this, error);
  }
}
