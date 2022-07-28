import { BaseModel } from './base';

export type OrderModel = BaseModel & {
  userId: string;
  totalValue: number;
};
