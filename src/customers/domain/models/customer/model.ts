import { BaseModel } from '@/shared/models';

export class CustomerModel extends BaseModel {
  public name!: string;

  public email!: string;

  constructor(partial: CustomerModel) {
    super();
    Object.assign(this, partial);
  }
}
