import { PaymentProfileModel } from '@/domain/models';

export class CreatePaymentProfileDto<Type = 'CARD_PAYMENT' | 'PHONE_PAYMENT'> {
  public customerId!: string;

  public type!: Type;

  public data!: Omit<PaymentProfileModel<Type>['data'], 'firstSix' | 'lastFour'>;
}
