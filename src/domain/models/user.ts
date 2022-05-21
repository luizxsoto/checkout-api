import { BaseModel } from './base';
import { Roles } from './session';

export class UserModel extends BaseModel {
  public name!: string;

  public email!: string;

  public password!: string;

  public roles!: Roles[];

  constructor(partial: UserModel) {
    super();
    Object.assign(this, partial);
  }
}
