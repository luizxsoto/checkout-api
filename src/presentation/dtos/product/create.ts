export class CreateProductDto {
  public name!: string;

  public category!: 'clothes' | 'shoes' | 'others';

  public image!: string;

  public price!: number;
}
