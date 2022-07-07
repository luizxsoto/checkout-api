import { BaseModel } from './base';

export type OrderStatus = 'AWAITING_PAYMENT' | 'PAID' | 'NOT_PAID';

export class OrderModel extends BaseModel {
  public customerId!: string;

  public paymentProfileId!: string;

  public status!: OrderStatus;

  public totalValue!: number;

  constructor(partial: OrderModel) {
    super();
    Object.assign(this, partial);
  }
}
