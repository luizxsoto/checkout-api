import { BaseModel } from './base';

export class PaymentProfileModel extends BaseModel {
  public userId!: string;

  public type!: 'CREDIT' | 'DEBIT';

  public brand!: string;

  public holderName!: string;

  public number!: string;

  public firstSix!: string;

  public lastFour!: string;

  public cvv!: string;

  public expiryMonth!: number;

  public expiryYear!: number;

  constructor(partial: PaymentProfileModel) {
    super();
    Object.assign(this, partial);
  }
}
