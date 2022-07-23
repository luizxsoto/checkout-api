import lodashGet from 'lodash.get';

import { FieldValidation } from '@/validation/protocols';

export type Options = {
  props: { modelKey: string; dataKey: string }[];
  ignoreProps?: { modelKey: string; dataKey: string }[];
  dataEntity: string;
};

export class Validator implements FieldValidation.Validation<Options> {
  constructor(public readonly options: Options) {}

  public async validate({
    key,
    model,
    data,
  }: FieldValidation.Params): Promise<FieldValidation.Result> {
    const value = lodashGet(model, key);
    if (value === undefined) return null;

    const findedRegister = data[this.options.dataEntity].find((dataItem) =>
      this.options.props.every((prop) => {
        let modelKey = (key as string).split('.').slice(0, -1).join('.');
        modelKey += modelKey ? `.${prop.modelKey}` : prop.modelKey;
        return lodashGet(dataItem, prop.dataKey) === lodashGet(model, modelKey);
      }),
    );

    const isSameIgnoreProps =
      findedRegister &&
      this.options.ignoreProps?.every((ignoreProp) => {
        let modelKey = (key as string).split('.').slice(0, -1).join('.');
        modelKey += modelKey ? `.${ignoreProp.modelKey}` : ignoreProp.modelKey;
        return lodashGet(findedRegister, ignoreProp.dataKey) === lodashGet(model, modelKey);
      });

    if (!findedRegister || isSameIgnoreProps) return null;

    return {
      field: key as string,
      rule: 'unique',
      message: 'This value has already been used',
      details: { findedRegister },
    };
  }
}
