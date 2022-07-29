/* eslint-disable no-restricted-syntax */
import { ValidationService } from '@/data/contracts/services'
import { ValidationException } from '@/main/exceptions'
import { FieldValidation, ValidationError } from '@/validation/protocols'

export function makeValidationServiceStub() {
  const validationErrors: ValidationError[] = []

  async function performValidation(
    validations: FieldValidation.Validation[],
    key: string,
    model: Record<string, unknown>,
    data: Record<string, any[]>
  ): Promise<void> {
    for await (const validation of validations) {
      const validationResult = await validation.validate({ key, model, data })

      if (validationResult) {
        validationErrors.push(validationResult)
        break
      }
    }
  }

  async function validate({
    schema,
    model,
    data,
  }: ValidationService.Params): Promise<ValidationService.Result> {
    await Promise.all(
      Object.keys(schema).map(async (key) => performValidation(schema[key], key, model, data))
    )

    if (validationErrors.length) throw new ValidationException(validationErrors)
  }

  return {
    performValidation: jest.fn().mockImplementation(performValidation),
    validate: jest.fn().mockImplementation(validate),
  }
}
