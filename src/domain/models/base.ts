export abstract class BaseModel {
  public id!: string;

  public createUserId!: string;

  public updateUserId?: string;

  public createdAt!: Date;

  public updatedAt?: Date;

  public deletedAt?: Date;
}
