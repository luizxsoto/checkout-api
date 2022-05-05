export interface Rules {
  required: (options?: null) => { name: 'required'; options: Parameters<Rules['required']>[0] };
  string: (options: { minLength?: number; maxLength?: number }) => {
    name: 'string';
    options: Parameters<Rules['string']>[0];
  };
  email: (options?: null) => { name: 'email'; options: Parameters<Rules['email']>[0] };
  unique: (options: { props?: { modelKey: string; dataKey: string }[]; dataEntity: string }) => {
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

export type Result = void;

export interface Validator<Model, ValidatorData extends Record<string, () => Promise<any[]>>> {
  rules: Rules;

  validate: (payload: Params<Model, ValidatorData>) => Promise<Result>;
}
