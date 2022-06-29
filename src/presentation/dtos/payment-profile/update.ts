import { CreatePaymentProfileDto } from './create';

export class UpdatePaymentProfileDto<
  PaymentMethod = 'CARD_PAYMENT' | 'PHONE_PAYMENT',
> extends CreatePaymentProfileDto<PaymentMethod> {
  public id!: string;
}
