import lodashGet from 'lodash.get';

import { FieldValidation } from '@/validation/protocols';
import { ArrayValidation, ObjectValidation } from '@/validation/validators';

export type Options = {
  schema: Record<string, [ArrayValidation.Validator]>;
};

export class Validator implements FieldValidation.Validation<Options> {
  constructor(
    public readonly options: Options,
    private readonly objectValidation: ObjectValidation.Validator,
  ) {}

  public async validate({
    key,
    model,
    data,
  }: FieldValidation.Params): Promise<FieldValidation.Result> {
    const value = lodashGet(model, key) as string;
    if (value === undefined) return null;

    type PrimitiveType = string | number;
    type FilterType = [PrimitiveType, PrimitiveType, PrimitiveType | PrimitiveType[]];
    type OperatorType = [string, ...(OperatorType | FilterType)[]];

    let arrayValue!: OperatorType;

    const posibleFields = Object.keys(this.options.schema);
    const validationError = {
      field: key as string,
      rule: 'listFilters',
      message: `This value must be a valid list filters and with this posible fields: ${posibleFields.join(
        ', ',
      )}`,
    };

    try {
      arrayValue = JSON.parse(value.replace(/'/g, "''"));
    } catch {
      return validationError;
    }

    if (!Array.isArray(arrayValue)) return validationError;
    if (!arrayValue.length) return null;

    const filters = {} as Record<string, PrimitiveType[]>;
    posibleFields.forEach((posibleField) => {
      filters[posibleField] = [] as PrimitiveType[];
    });

    function addValueToModel(
      operator: string,
      fieldOrFilter: OperatorType | FilterType,
      values: OperatorType | FilterType,
    ) {
      const filterOperators = ['&', '|'];
      const isFieldOperator =
        typeof fieldOrFilter === 'string' && !filterOperators.includes(operator as string);

      if (isFieldOperator) {
        const valuesToPush = (Array.isArray(values) ? values : [values]) as PrimitiveType[];

        filters[fieldOrFilter].push(...valuesToPush);
      }
    }

    const operatorsValidationDict: Record<string, (item: OperatorType | FilterType) => boolean> = {
      '&': (item: OperatorType | FilterType) => {
        const [, ...restItems] = item;

        const isAllRestItemsValid = (restItems as (OperatorType | FilterType)[]).every(
          (restItem) => {
            if (!Array.isArray(restItem) || !restItem.length) return false;

            const [operator, fieldOrFilter, values] = restItem;

            if (!operatorsValidationDict[operator]?.(restItem)) return false;

            addValueToModel(
              operator as string,
              fieldOrFilter as OperatorType | FilterType,
              values as OperatorType | FilterType,
            );

            return true;
          },
        );

        return isAllRestItemsValid && !!restItems.length;
      },
      '|': (item: OperatorType | FilterType) => operatorsValidationDict['&'](item),
      '=': (item: OperatorType | FilterType) => {
        const [, field, values] = item;

        if (
          typeof field !== 'string' ||
          !posibleFields.includes(field) ||
          (typeof values !== 'string' && typeof values !== 'number')
        ) {
          return false;
        }

        return true;
      },
      '!=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      '>': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      '>=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      '<': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      '<=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      ':': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      '!:': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
      in: (item: OperatorType | FilterType) => {
        const [, field, values] = item;

        if (
          typeof field !== 'string' ||
          !posibleFields.includes(field) ||
          !Array.isArray(values) ||
          (values as []).some(
            (valuesItem) => typeof valuesItem !== 'string' && typeof valuesItem !== 'number',
          )
        ) {
          return false;
        }

        return true;
      },
    };

    const [operator, fieldOrFilter, values] = arrayValue;

    if (!operatorsValidationDict[operator]?.(arrayValue)) return validationError;

    addValueToModel(operator, fieldOrFilter, values);

    return this.objectValidation.validate({ key: 'filters', model: { filters }, data });
  }
}
