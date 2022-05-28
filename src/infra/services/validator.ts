/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import lodashGet from 'lodash.get';

import { ValidatorService } from '@/data/contracts/services';
import { Rule, Rules } from '@/data/contracts/services/validator';
import { ValidationException, ValidationItem } from '@/main/exceptions';

export class VanillaValidatorService<Model, ValidatorData extends Record<string, any[]>>
  implements ValidatorService.Validator<Model, ValidatorData>
{
  private validations: ValidationItem[] = [];

  private async performValidation(
    rules: Rule[],
    key: keyof Model,
    model: Model,
    data: ValidatorData,
  ) {
    for (const rule of rules) {
      const validation = await this.validationRules[rule.name](key, rule.options, model, data);

      if (validation) {
        this.validations.push(validation);
        break;
      }
    }
  }

  public async validate(
    params: ValidatorService.Params<Model, ValidatorData>,
  ): Promise<ValidatorService.Result> {
    await Promise.allSettled(
      Object.keys(params.schema).map((key) =>
        this.performValidation(
          params.schema[key as keyof Model],
          key as keyof Model,
          params.model,
          params.data,
        ),
      ),
    );

    if (this.validations.length) throw new ValidationException(this.validations);
  }

  public rules: ValidatorService.Rules = {
    required: (options) => ({ name: 'required', options }),
    string: (options) => ({ name: 'string', options }),
    in: (options) => ({ name: 'in', options }),
    number: (options) => ({ name: 'number', options }),
    min: (options) => ({ name: 'min', options }),
    max: (options) => ({ name: 'max', options }),
    regex: (options) => ({ name: 'regex', options }),
    length: (options) => ({ name: 'length', options }),
    unique: (options) => ({ name: 'unique', options }),
    exists: (options) => ({ name: 'exists', options }),
    array: (options) => ({ name: 'array', options }),
    object: (options) => ({ name: 'object', options }),
    custom: (options) => ({ name: 'custom', options }),
  };

  private validationRules: Record<
    keyof ValidatorService.Rules,
    (
      key: keyof Model,
      options: any,
      model: ValidatorService.Params<Model, ValidatorData>['model'],
      data: ValidatorService.Params<Model, ValidatorData>['data'],
    ) => null | ValidationItem | Promise<null | ValidationItem>
  > = {
    required: (key, _options, model) => {
      const value = lodashGet(model, key);
      if (value !== null && value !== undefined) return null;

      return {
        field: key as string,
        rule: 'required',
        message: 'This value is required',
      };
    },
    string: (key, _options, model) => {
      const value = lodashGet(model, key);
      if (value === undefined || typeof value === 'string') return null;

      return {
        field: key as string,
        rule: 'string',
        message: 'This value must be a string',
      };
    },
    in: (key, options: Parameters<Rules['in']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || options.values.includes(value as unknown as string)) return null;

      return {
        field: key as string,
        rule: 'in',
        message: `This value must be in: ${options.values.join(', ')}`,
      };
    },
    number: (key, _options, model) => {
      const value = lodashGet(model, key);
      if (value === undefined || !Number.isNaN(Number(value))) return null;

      return {
        field: key as string,
        rule: 'number',
        message: 'This value must be a number',
      };
    },
    min: (key, options: Parameters<Rules['min']>[0], model) => {
      const value = lodashGet(model, key);
      if (Number.isNaN(Number(value)) || (value as unknown as number) >= options.value) return null;

      return {
        field: key as string,
        rule: 'min',
        message: `This value must be bigger than: ${options.value}`,
      };
    },
    max: (key, options: Parameters<Rules['max']>[0], model) => {
      const value = lodashGet(model, key);
      if (Number.isNaN(Number(value)) || (value as unknown as number) <= options.value) return null;

      return {
        field: key as string,
        rule: 'max',
        message: `This value must be smaller than: ${options.value}`,
      };
    },
    regex: (key, options: Parameters<Rules['regex']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const regexDict = {
        custom: options.customPattern ?? /^\w$/,
        name: /^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/,
        email: /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        uuidV4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      };

      if (typeof value !== 'string' || !regexDict[options.pattern].test(value as unknown as string))
        return {
          field: key as string,
          rule: 'regex',
          message: `This value must be valid according to the pattern: ${
            options.customPattern ?? options.pattern
          }`,
        };

      return null;
    },
    length: (key, options: Parameters<Rules['length']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || (typeof value !== 'string' && !Array.isArray(value))) return null;

      const parsedValue = value as unknown as string | Array<any>;

      if (parsedValue.length < options.minLength || parsedValue.length > options.maxLength) {
        return {
          field: key as string,
          rule: 'length',
          message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
        };
      }

      return null;
    },
    unique: (key, options: Parameters<Rules['unique']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const registerFinded = data[options.dataEntity].find((dataItem) =>
        options.props.every(
          (prop) => dataItem[prop.dataKey] === model[prop.modelKey as keyof Model],
        ),
      );

      const isSameIgnoreProps =
        registerFinded &&
        options.ignoreProps?.every(
          (ignoreProp) =>
            registerFinded[ignoreProp.dataKey] === model[ignoreProp.modelKey as keyof Model],
        );

      if (!registerFinded || isSameIgnoreProps) return null;

      return {
        field: key as string,
        rule: 'unique',
        message: 'This value has already been used',
      };
    },
    exists: (key, options: Parameters<Rules['exists']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const registerFinded = data[options.dataEntity].find((dataItem) =>
        options.props.every(
          (prop) => dataItem[prop.dataKey] === model[prop.modelKey as keyof Model],
        ),
      );

      if (registerFinded) return null;

      return {
        field: key as string,
        rule: 'exists',
        message: 'This value was not found',
      };
    },
    array: async (key, options: Parameters<Rules['array']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      if (!Array.isArray(value))
        return {
          field: key as string,
          rule: 'array',
          message: 'This value must be an array',
        };

      await Promise.allSettled(
        value.map((_, index) =>
          this.performValidation(options.rules, `${key}.${index}` as keyof Model, model, data),
        ),
      );

      return null;
    },
    object: async (key, options: Parameters<Rules['object']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      if (typeof value !== 'object' || Array.isArray(value))
        return {
          field: key as string,
          rule: 'array',
          message: 'This value must be an object',
        };

      await this.validate({
        model: value,
        schema: options.schema as Record<keyof Model, Rule[]>,
        data,
      });

      return null;
    },
    custom: async (key, options: Parameters<Rules['custom']>[0]) => {
      if (await options.validation()) return null;

      return {
        field: key as string,
        rule: options.rule,
        message: options.message,
      };
    },
  };
}
