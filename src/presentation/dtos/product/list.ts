export class ListProductDto {
  public page?: number;

  public perPage?: number;

  public orderBy?: 'name' | 'category' | 'price' | 'createdAt' | 'updatedAt';

  public order?: 'asc' | 'desc';

  public filters?: string;
}
