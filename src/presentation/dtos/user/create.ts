import { Roles } from '@/domain/models';

export class CreateUserDto {
  public name!: string;

  public email!: string;

  public password!: string;

  public roles!: Roles[];
}
