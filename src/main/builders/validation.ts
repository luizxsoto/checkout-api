import { ValidationService } from '@/data/contracts/services';
import { FieldValidation } from '@/validation/protocols';
import {
  ArrayValidation,
  DistinctValidation,
  InValidation,
  LengthValidation,
  ObjectValidation,
  RegexValidation,
  RequiredValidation,
  StringValidation,
  UniqueValidation,
} from '@/validation/validators';

export class ValidationBuilder {
  private validations: FieldValidation.Validation[] = [];

  public build(): FieldValidation.Validation[] {
    return this.validations;
  }

  public string(options?: StringValidation.Options): ValidationBuilder {
    this.validations.push(new StringValidation.Validator(options));
    return this;
  }

  public object(
    options: ObjectValidation.Options,
    validationService: ValidationService.Validator,
  ): ValidationBuilder {
    this.validations.push(new ObjectValidation.Validator(options, validationService));
    return this;
  }

  public array(
    options: ArrayValidation.Options,
    validationService: ValidationService.Validator,
  ): ValidationBuilder {
    this.validations.push(new ArrayValidation.Validator(options, validationService));
    return this;
  }

  public required(options?: RequiredValidation.Options): ValidationBuilder {
    this.validations.push(new RequiredValidation.Validator(options));
    return this;
  }

  public length(options: LengthValidation.Options): ValidationBuilder {
    this.validations.push(new LengthValidation.Validator(options));
    return this;
  }

  public regex(options: RegexValidation.Options): ValidationBuilder {
    this.validations.push(new RegexValidation.Validator(options));
    return this;
  }

  public in(options: InValidation.Options): ValidationBuilder {
    this.validations.push(new InValidation.Validator(options));
    return this;
  }

  public distinct(options?: DistinctValidation.Options): ValidationBuilder {
    this.validations.push(new DistinctValidation.Validator(options));
    return this;
  }

  public unique(options: UniqueValidation.Options): ValidationBuilder {
    this.validations.push(new UniqueValidation.Validator(options));
    return this;
  }
}
