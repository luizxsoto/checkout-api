import { BaseModel } from './base';

export class PaymentProfileModel<Type = 'CARD_PAYMENT' | 'PHONE_PAYMENT'> extends BaseModel {
  public customerId!: string;

  public type!: Type;

  public data!: Type extends 'CARD_PAYMENT'
    ? {
        type: 'CREDIT' | 'DEBIT';
        brand: string;
        holderName: string;
        cardNumber: string;
        cardCVV: string;
        expiryMonth: string;
        expiryYear: string;
      }
    : {
        countryCode: string;
        areaCode: string;
        number: string;
      };

  constructor(partial: PaymentProfileModel) {
    super();
    Object.assign(this, partial);
  }
}
