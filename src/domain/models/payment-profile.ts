import { BaseModel } from './base';

export class PaymentProfileModel<
  PaymentMethod = 'CARD_PAYMENT' | 'PHONE_PAYMENT',
> extends BaseModel {
  public customerId!: string;

  public paymentMethod!: PaymentMethod;

  public data!: PaymentMethod extends 'CARD_PAYMENT'
    ? {
        type: 'CREDIT' | 'DEBIT';
        brand: string;
        holderName: string;
        number: string;
        firstSix: string;
        lastFour: string;
        cvv: string;
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
