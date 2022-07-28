import { BaseModel } from './base';
import { Roles } from './session';

export type UserModel = BaseModel & {
  name: string;
  email: string;
  password: string;
  roles: Roles[];
};
