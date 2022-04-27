import { CreateCustomerValidator } from '@/data/contracts/validators';
import { ValidationException, ValidationItem } from '@/infra/exceptions';

export class VanillaCreateCustomerValidator implements CreateCustomerValidator.Validator {
  public validate(params: CreateCustomerValidator.Params): CreateCustomerValidator.Result {
    const validations: ValidationItem[] = [];

    this.validateName(params, validations);
    this.validateEmail(params, validations);

    if (validations.length) throw new ValidationException(validations);

    return params.requestModel;
  }

  private validateName(
    params: CreateCustomerValidator.Params,
    validations: ValidationItem[],
  ): void {
    const { requestModel } = params;
    const MIN_NAME_LENGTH = 6;
    const MAX_NAME_LENGTH = 100;

    if (!requestModel.name)
      validations.push({
        field: 'name',
        validation: 'required',
        message: 'This value is required',
      });
    else if (typeof requestModel.name !== 'string')
      validations.push({
        field: 'name',
        validation: 'string',
        message: 'This value must be a string',
      });
    else if (
      requestModel.name.length < MIN_NAME_LENGTH ||
      requestModel.name.length > MAX_NAME_LENGTH
    )
      validations.push({
        field: 'name',
        validation: 'length',
        message: `The length of this value must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH}`,
      });
  }

  private validateEmail(
    params: CreateCustomerValidator.Params,
    validations: ValidationItem[],
  ): void {
    const { requestModel, validatorData } = params;
    const MIN_EMAIL_LENGTH = 6;
    const MAX_EMAIL_LENGTH = 100;

    if (!requestModel.email)
      validations.push({
        field: 'email',
        validation: 'required',
        message: 'This value is required',
      });
    else if (typeof requestModel.email !== 'string')
      validations.push({
        field: 'email',
        validation: 'string',
        message: 'This value must be a string',
      });
    else if (!/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(requestModel.email))
      validations.push({
        field: 'email',
        validation: 'email',
        message: 'This value must be a valid email',
      });
    else if (
      requestModel.email.length < MIN_EMAIL_LENGTH ||
      requestModel.email.length > MAX_EMAIL_LENGTH
    )
      validations.push({
        field: 'email',
        validation: 'length',
        message: `The length of this value must be between ${MIN_EMAIL_LENGTH} and ${MAX_EMAIL_LENGTH}`,
      });
    else if (
      validatorData.findedCustomers.some(
        (findedCustomer) => findedCustomer.email === requestModel.email,
      )
    )
      validations.push({
        field: 'email',
        validation: 'unique',
        message: 'This value is already used',
      });
  }
}
