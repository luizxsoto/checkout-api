export abstract class BaseModel {
  public id!: string;

  public createdAt: Date = new Date();

  public updatedAt?: Date;

  public deletedAt?: Date;
}
