export class ListPaymentProfileDto {
  public page?: number;

  public perPage?: number;

  public orderBy?: 'userId' | 'type' | 'createdAt' | 'updatedAt';

  public order?: 'asc' | 'desc';

  public filters?: string;
}
