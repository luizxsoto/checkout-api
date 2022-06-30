export class ListPaymentProfileDto {
  public page?: number;

  public perPage?: number;

  public orderBy?: 'customerId' | 'paymentMethod' | 'createdAt' | 'updatedAt';

  public order?: 'asc' | 'desc';

  public filters?: string;
}
