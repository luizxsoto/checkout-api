import { BaseModel } from './base';

export class OrderModel extends BaseModel {
  public customerId!: string;

  public paymentProfileId!: string;

  public totalValue!: number;

  constructor(partial: OrderModel) {
    super();
    Object.assign(this, partial);
  }
}
