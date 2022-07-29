import { CreateUserDto } from './create'

export class UpdateUserDto extends CreateUserDto {
  public id!: string
}
