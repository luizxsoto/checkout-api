import { BaseModel } from './base';

export class ProductModel extends BaseModel {
  public name!: string;

  public category!: 'clothes' | 'shoes' | 'others';

  public image!: string;

  public price!: number;

  constructor(partial: ProductModel) {
    super();
    Object.assign(this, partial);
  }
}
