export interface Rules {
  required: (options?: null) => { name: 'required'; options: Parameters<Rules['required']>[0] };
  string: (options?: null) => { name: 'string'; options: Parameters<Rules['string']>[0] };
  regex: (options: { pattern: 'custom' | 'name' | 'email' | 'uuidV4'; customPattern?: RegExp }) => {
    name: 'regex';
    options: Parameters<Rules['regex']>[0];
  };
  length: (options: { minLength: number; maxLength: number }) => {
    name: 'length';
    options: Parameters<Rules['length']>[0];
  };
  unique: (options: {
    props: { modelKey: string; dataKey: string }[];
    ignoreProps?: { modelKey: string; dataKey: string }[];
    dataEntity: string;
  }) => {
    name: 'unique';
    options: Parameters<Rules['unique']>[0];
  };
}

export type Rule<Key extends keyof Rules = keyof Rules> = {
  name: Key;
  options?: ReturnType<Rules[Key]>['options'];
};

export type Params<Model, ValidatorData extends Record<string, () => Promise<any[]>>> = {
  schema: Record<keyof Model, Rule[]>;
  model: Model;
  data: ValidatorData;
};

export type Result<ValidatorData extends Record<string, () => Promise<any[]>>> = Record<
  keyof ValidatorData,
  any[]
>;

export interface Validator<Model, ValidatorData extends Record<string, () => Promise<any[]>>> {
  rules: Rules;

  validate: (payload: Params<Model, ValidatorData>) => Promise<Result<ValidatorData>>;
}
