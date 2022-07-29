import { CreateProductDto } from './create'

export class UpdateProductDto extends CreateProductDto {
  public id!: string
}
