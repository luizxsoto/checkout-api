import { ValidationError } from './error';

export type Params = {
  key: string;
  model: Record<string, unknown>;
  data: Record<string, any[]>;
};

export type Result = null | ValidationError;

export interface Validation<Options = any> {
  options?: Options;
  validate: (params: Params) => Result | Promise<Result>;
}
