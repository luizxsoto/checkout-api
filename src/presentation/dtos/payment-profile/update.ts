import { CreatePaymentProfileDto } from './create';

export class UpdatePaymentProfileDto<
  Type = 'CARD_PAYMENT' | 'PHONE_PAYMENT',
> extends CreatePaymentProfileDto<Type> {
  public id!: string;
}
