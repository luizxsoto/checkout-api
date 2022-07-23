/* eslint-disable no-restricted-syntax */
import { ValidationService } from '@/data/contracts/services';
import { ValidationException } from '@/main/exceptions';
import { FieldValidation, ValidationError } from '@/validation/protocols';

export class CompositeValidation implements ValidationService.Validator {
  private validationErrors: ValidationError[] = [];

  public async performValidation(
    validations: FieldValidation.Validation[],
    key: string,
    model: Record<string, unknown>,
    data: Record<string, any[]>,
  ): Promise<void> {
    for await (const validation of validations) {
      const validationResult = await validation.validate({ key, model, data });

      if (validationResult) {
        this.validationErrors.push(validationResult);
        break;
      }
    }
  }

  public async validate({
    schema,
    model,
    data,
  }: ValidationService.Params): Promise<ValidationService.Result> {
    await Promise.all(
      Object.keys(schema).map(async (key) => this.performValidation(schema[key], key, model, data)),
    );

    if (this.validationErrors.length) throw new ValidationException(this.validationErrors);
  }
}
