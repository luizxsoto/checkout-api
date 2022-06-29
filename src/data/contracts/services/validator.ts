/* eslint-disable no-use-before-define */

export interface Rules {
  required: (options?: null) => { name: 'required'; options: Parameters<Rules['required']>[0] };
  string: (options?: null) => { name: 'string'; options: Parameters<Rules['string']>[0] };
  date: (options?: null) => { name: 'date'; options: Parameters<Rules['date']>[0] };
  in: (options: { values: string[] }) => { name: 'in'; options: Parameters<Rules['in']>[0] };
  number: (options?: null) => { name: 'number'; options: Parameters<Rules['number']>[0] };
  integerString: (options?: null) => {
    name: 'integerString';
    options: Parameters<Rules['integerString']>[0];
  };
  min: (options: { value: number }) => { name: 'min'; options: Parameters<Rules['min']>[0] };
  max: (options: { value: number }) => { name: 'max'; options: Parameters<Rules['max']>[0] };
  regex: (options: {
    pattern: 'custom' | 'name' | 'email' | 'password' | 'uuidV4';
    customPattern?: RegExp;
  }) => {
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
  exists: (options: { props: { modelKey: string; dataKey: string }[]; dataEntity: string }) => {
    name: 'exists';
    options: Parameters<Rules['exists']>[0];
  };
  array: (options: { rules: Rule[] }) => {
    name: 'array';
    options: Parameters<Rules['array']>[0];
  };
  object: (options: { schema: Record<string, Rule[]> }) => {
    name: 'object';
    options: Parameters<Rules['object']>[0];
  };
  listFilters: <Model>(options: { schema: Record<keyof Model, [Rule<'array'>]> }) => {
    name: 'listFilters';
    options: Parameters<Rules['listFilters']>[0];
  };
  custom: (options: { validation: () => Promise<boolean>; rule: string; message: string }) => {
    name: 'custom';
    options: Parameters<Rules['custom']>[0];
  };
}

export type Rule<Key extends keyof Rules = keyof Rules> = {
  name: Key;
  options?: ReturnType<Rules[Key]>['options'];
};

export type Params<Model, ValidatorData extends Record<string, any[]>> = {
  schema: Record<keyof Model, Rule[]>;
  model: Model;
  data: ValidatorData;
};

export type Result = void;

export interface Validator<Model, ValidatorData extends Record<string, any[]>> {
  rules: Rules;

  validate: (payload: Params<Model, ValidatorData>) => Promise<Result>;
}
