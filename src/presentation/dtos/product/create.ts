export class CreateProductDto {
  public name!: string

  public category!: 'clothes' | 'shoes' | 'others'

  public colors!: Array<'black' | 'white' | 'blue' | 'red' | 'other'>

  public image!: string

  public price!: number
}
