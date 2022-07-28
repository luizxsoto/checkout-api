import { BaseModel } from './base';

export type OrderItemModel = BaseModel & {
  orderId: string;
  productId: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
};
