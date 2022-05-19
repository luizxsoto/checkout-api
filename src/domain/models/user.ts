import { BaseModel } from './base';

export class UserModel extends BaseModel {
  public name!: string;

  public email!: string;

  public username!: string;

  public password!: string;

  constructor(partial: UserModel) {
    super();
    Object.assign(this, partial);
  }
}
