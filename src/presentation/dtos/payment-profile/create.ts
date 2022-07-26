import { PaymentProfileModel } from '@/domain/models';

export class CreatePaymentProfileDto<PaymentMethod = 'CARD_PAYMENT' | 'PHONE_PAYMENT'> {
  public userId!: string;

  public paymentMethod!: PaymentMethod;

  public data!: Omit<PaymentProfileModel<PaymentMethod>['data'], 'firstSix' | 'lastFour'>;
}
