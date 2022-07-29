export class ListUserDto {
  public page?: number

  public perPage?: number

  public orderBy?: 'name' | 'email' | 'createdAt' | 'updatedAt'

  public order?: 'asc' | 'desc'

  public filters?: string
}
