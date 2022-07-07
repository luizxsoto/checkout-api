import { BaseModel } from './base';

export class OrderItemModel extends BaseModel {
  public orderId!: string;

  public productId!: string;

  public quantity!: number;

  public unitValue!: number;

  public totalValue!: number;

  constructor(partial: OrderItemModel) {
    super();
    Object.assign(this, partial);
  }
}
