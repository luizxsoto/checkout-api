export class ListOrderDto {
  public page?: number;

  public perPage?: number;

  public orderBy?: 'userId' | 'totalValue' | 'createdAt' | 'updatedAt';

  public order?: 'asc' | 'desc';

  public filters?: string;
}
