export class CreateProductDto {
  public name!: string;

  public category!: 'clothes' | 'shoes' | 'others';

  public price!: number;
}
