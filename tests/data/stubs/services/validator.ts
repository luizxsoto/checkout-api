/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { ValidatorService } from '@/data/contracts/services';
import { Rules } from '@/data/contracts/services/validator';
import { ValidationException, ValidationItem } from '@/infra/exceptions';

export function makeValidatorServiceStub<
  Model,
  ValidatorData extends Record<string, () => Promise<any[]>>,
>() {
  const validatorData = {} as Record<keyof ValidatorData, any[]>;

  return {
    rules: <ValidatorService.Rules>{
      required: (options) => ({ name: 'required', options }),
      string: (options) => ({ name: 'string', options }),
      regex: (options) => ({ name: 'regex', options }),
      length: (options) => ({ name: 'length', options }),
      unique: (options) => ({ name: 'unique', options }),
      exists: (options) => ({ name: 'exists', options }),
    },
    validate: jest
      .fn()
      .mockImplementation(
        async (
          params: ValidatorService.Params<Model, ValidatorData>,
        ): Promise<ValidatorService.Result<ValidatorData>> => {
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
              if (typeof model[key] === 'string') return null;
              return {
                field: key as string,
                rule: 'string',
                message: 'This value must be a string',
              };
            },
            regex: (key, options: Parameters<Rules['regex']>[0], model) => {
              const regexDict = {
                custom: options.customPattern ?? /^\w$/,
                name: /^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/,
                email: /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/,
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
            unique: async (key, options: Parameters<Rules['unique']>[0], model, data) => {
              const findedData = await data[options.dataEntity]();
              validatorData[options.dataEntity as keyof ValidatorData] = [
                ...(validatorData[options.dataEntity] ?? []),
                ...findedData,
              ];

              const registerFinded = findedData.find((dataItem) =>
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
            exists: async (key, options: Parameters<Rules['exists']>[0], model, data) => {
              const findedData = await data[options.dataEntity]();
              validatorData[options.dataEntity as keyof ValidatorData] = [
                ...(validatorData[options.dataEntity] ?? []),
                ...findedData,
              ];

              const registerFinded = findedData.find((dataItem) =>
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
            }),
          );

          if (validations.length) throw new ValidationException(validations);

          return validatorData;
        },
      ),
  };
}
