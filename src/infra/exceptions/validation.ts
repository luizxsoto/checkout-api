import { ApplicationException } from '@/main/exceptions';

export interface ValidationItem {
  field: string;
  validation: string;
  message: string;
}

export class ValidationException extends ApplicationException {
  constructor(private readonly validations: ValidationItem[]) {
    super({
      name: 'ValidationException',
      code: 'VALIDATION_EXCEPTION',
      message: 'An error ocurred performing a validation',
    });
  }
}
