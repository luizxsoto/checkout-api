import { CreatePaymentProfileDto } from './create';

export class UpdatePaymentProfileDto extends CreatePaymentProfileDto {
  public id!: string;
}
