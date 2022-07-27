export class CreatePaymentProfileDto {
  public userId!: string;

  public type!: 'CREDIT' | 'DEBIT';

  public brand!: string;

  public holderName!: string;

  public number!: string;

  public cvv!: string;

  public expiryMonth!: number;

  public expiryYear!: number;
}
