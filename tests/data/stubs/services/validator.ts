/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { ValidatorService } from '@/data/contracts/services';
import { Rules } from '@/data/contracts/services/validator';
import { ValidationException, ValidationItem } from '@/main/exceptions';

export function makeValidatorServiceStub<Model, ValidatorData extends Record<string, any[]>>() {
  return <
    {
      rules: ValidatorService.Rules;
      validate: (
        payload: ValidatorService.Params<Model, ValidatorData>,
      ) => Promise<ValidatorService.Result>;
    }
  >{
    rules: {
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
      custom: (options) => ({ name: 'custom', options }),
    },
    validate: jest
      .fn()
      .mockImplementation(
        async (
          params: ValidatorService.Params<Model, ValidatorData>,
        ): Promise<ValidatorService.Result> => {
          const validationRules: Record<
            keyof ValidatorService.Rules,
            (
              key: keyof Model,
              options: any,
              model: ValidatorService.Params<Model, ValidatorData>['model'],
              data: ValidatorService.Params<Model, ValidatorData>['data'],
            ) => null | ValidationItem | Promise<null | ValidationItem>
          > = {
            required: (key, _options, model) => {
              if (model[key]) return null;

              return {
                field: key as string,
                rule: 'required',
                message: 'This value is required',
              };
            },
            string: (key, _options, model) => {
              if (!model[key] || typeof model[key] === 'string') return null;

              return {
                field: key as string,
                rule: 'string',
                message: 'This value must be a string',
              };
            },
            in: (key, options: Parameters<Rules['in']>[0], model) => {
              if (!model[key] || options.values.includes(model[key] as unknown as string))
                return null;

              return {
                field: key as string,
                rule: 'in',
                message: `This value must be in: ${options.values.join(', ')}`,
              };
            },
            number: (key, _options, model) => {
              if (!model[key] || !Number.isNaN(Number(model[key]))) return null;

              return {
                field: key as string,
                rule: 'number',
                message: 'This value must be a number',
              };
            },
            min: (key, options: Parameters<Rules['min']>[0], model) => {
              if (
                Number.isNaN(Number(model[key])) ||
                (model[key] as unknown as number) >= options.value
              )
                return null;

              return {
                field: key as string,
                rule: 'min',
                message: `This value must be bigger than: ${options.value}`,
              };
            },
            max: (key, options: Parameters<Rules['max']>[0], model) => {
              if (
                Number.isNaN(Number(model[key])) ||
                (model[key] as unknown as number) <= options.value
              )
                return null;

              return {
                field: key as string,
                rule: 'max',
                message: `This value must be smaller than: ${options.value}`,
              };
            },
            regex: (key, options: Parameters<Rules['regex']>[0], model) => {
              if (!model[key]) return null;

              const regexDict = {
                custom: options.customPattern ?? /^\w$/,
                name: /^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/,
                email: /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/,
                password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                uuidV4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
              };

              if (
                typeof model[key] !== 'string' ||
                !regexDict[options.pattern].test(model[key] as unknown as string)
              )
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
              if (!model[key]) return null;

              if (
                String(model[key]).length < options.minLength ||
                String(model[key]).length > options.maxLength
              ) {
                return {
                  field: key as string,
                  rule: 'length',
                  message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
                };
              }

              return null;
            },
            unique: (key, options: Parameters<Rules['unique']>[0], model, data) => {
              if (!model[key]) return null;

              const registerFinded = data[options.dataEntity].find((dataItem) =>
                options.props.every(
                  (prop) => dataItem[prop.dataKey] === model[prop.modelKey as keyof Model],
                ),
              );

              const isSameIgnoreProps =
                registerFinded &&
                options.ignoreProps?.every(
                  (ignoreProp) =>
                    registerFinded[ignoreProp.dataKey] ===
                    model[ignoreProp.modelKey as keyof Model],
                );

              if (!registerFinded || isSameIgnoreProps) return null;

              return {
                field: key as string,
                rule: 'unique',
                message: 'This value has already been used',
              };
            },
            exists: (key, options: Parameters<Rules['exists']>[0], model, data) => {
              if (!model[key]) return null;

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
            custom: async (key, options: Parameters<Rules['custom']>[0]) => {
              if (await options.validation()) return null;

              return {
                field: key as string,
                rule: options.rule,
                message: options.message,
              };
            },
          };

          const validations: ValidationItem[] = [];

          await Promise.allSettled(
            Object.keys(params.schema).map(async (key) => {
              const parsedKey = key as keyof Model;

              for (const rule of params.schema[parsedKey]) {
                const validation = await validationRules[rule.name](
                  parsedKey,
                  rule.options,
                  params.model,
                  params.data,
                );

                if (validation) {
                  validations.push(validation);
                  break;
                }
              }

              return null;
            }),
          );

          if (validations.length) throw new ValidationException(validations);
        },
      ),
  };
}
